"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import { supabase } from "@/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/ui/navigation-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, User, Target, Trophy, Brain, Zap, FileText, BarChart, Smile, AlertTriangle, Scale, ArrowLeft } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';

interface PromptHistory {
  id: string;
  prompt_text: string;
  response_text: string | null;
  score: number | null;
  experiment_name: string | null;
  user_id: string;
  team_code: string | null;
  created_at: string | null;
  hallucination_score: number | null;
  emotional_score: number | null;
  cta_score: number | null;
  cta_reason: string | null;
  is_best: boolean | null;
}

const ABTestDisplay = () => {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const experimentName = searchParams.get('experiment');
    const [allPrompts, setAllPrompts] = useState<PromptHistory[]>([]);
    const [selectedPrompts, setSelectedPrompts] = useState<PromptHistory[]>([]);
    const [showComparison, setShowComparison] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExperimentData = async () => {
            console.log("Checking fetch conditions...", { user: !!user, experimentName });
            if (!user || !experimentName) {
                setLoading(false);
                return;
            };

            setLoading(true);
            
            let query = supabase
                .from('prompt_history')
                .select('*')
                .eq('user_id', user.id);

            if (experimentName === 'Untitled Experiment') {
                query = query.is('experiment_name', null);
            } else {
                query = query.eq('experiment_name', experimentName);
            }

            const { data, error } = await query.order('created_at', { ascending: true });
            
            if (error) {
                console.error("Error fetching A/B test data:", error);
                setAllPrompts([]);
            } else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const fetchedPrompts = ((data as any[]) || []).map(p => ({
                    ...p,
                    hallucination_score: p.hallucination_score ?? null,
                    emotional_score: p.emotional_score ?? null,
                    cta_score: p.cta_score ?? null,
                    cta_reason: p.cta_reason ?? null,
                    is_best: p.is_best ?? null,
                }));
                setAllPrompts(fetchedPrompts as PromptHistory[]);
            }
            setLoading(false);
        };

        fetchExperimentData();
    }, [user, experimentName]);

    const handleSelectPrompt = (prompt: PromptHistory) => {
        setSelectedPrompts(prev => {
            const isSelected = prev.some(p => p.id === prompt.id);
            if (isSelected) {
                return prev.filter(p => p.id !== prompt.id);
            }
            if (prev.length < 2) {
                return [...prev, prompt];
            }
            return prev; // Don't add more than 2
        });
    };

    const getScoreColor = (score: number | null) => {
        if (score === null) return "text-gray-400";
        if (score >= 0.8) return "text-emerald-400";
        if (score >= 0.6) return "text-yellow-400";
        return "text-red-400";
    };

    const ComparisonView = ({ promptsToCompare }: { promptsToCompare: PromptHistory[] }) => {

        const getMetricValue = (prompt: PromptHistory, metric: string) => {
            let promptData: { prompt?: string; output?: string; latency?: number; tokens?: number } | null = null;
            try {
                promptData = JSON.parse(prompt.prompt_text);
            } catch (e) { /* Not a JSON object */ }

            switch (metric) {
                case 'Score': return prompt.score?.toFixed(2);
                case 'Latency': return promptData?.latency ? `${promptData.latency}ms` : 'N/A';
                case 'Tokens': return promptData?.tokens ?? 'N/A';
                case 'Hallucination': return prompt.hallucination_score?.toFixed(2);
                case 'Emotional': return prompt.emotional_score?.toFixed(2);
                case 'CTA Score': return prompt.cta_score?.toFixed(2);
                default: return 'N/A';
            }
        };

        const ComparisonChart = () => {
            const [isClient, setIsClient] = useState(false);
            useEffect(() => { setIsClient(true) }, []);

            if (!promptsToCompare || promptsToCompare.length < 2) return null;
        
            const getChartData = () => {
                const metrics = ['Score', 'Latency', 'Tokens', 'Hallucination', 'Emotional', 'CTA Score'];
                const data = metrics.map(metric => {
                    const values = promptsToCompare.map(p => {
                        const rawValue = getMetricValue(p, metric);
                        if (typeof rawValue === 'string') {
                            return parseFloat(rawValue.replace('ms', ''));
                        }
                        return rawValue;
                    });
            
                    const lowerIsBetter = ['Latency', 'Hallucination'];
                    const allValidValues = values.filter(v => v !== null && v !== undefined && !isNaN(v)) as number[];
                    if (allValidValues.length === 0) return { subject: metric, A: 0, B: 0, fullMark: 1 };
                    
                    const maxVal = Math.max(...allValidValues);
                    const minVal = Math.min(...allValidValues);

                    let p1_normalized = 0;
                    let p2_normalized = 0;

                    if (maxVal > minVal) {
                        p1_normalized = lowerIsBetter.includes(metric) ? (maxVal - (values[0] ?? 0)) / (maxVal - minVal) : ((values[0] ?? 0) - minVal) / (maxVal - minVal);
                        p2_normalized = lowerIsBetter.includes(metric) ? (maxVal - (values[1] ?? 0)) / (maxVal - minVal) : ((values[1] ?? 0) - minVal) / (maxVal - minVal);
                    } else if (allValidValues.length > 0) {
                        p1_normalized = 1;
                        p2_normalized = 1;
                    }
            
                    return {
                        subject: metric,
                        A: p1_normalized * 100,
                        B: p2_normalized * 100,
                        fullMark: 100,
                    };
                });
                return data.filter(d => d.A > 0 || d.B > 0);
            };
            
            const chartData = getChartData();

            if (!isClient) {
                return <div className="h-96 w-full bg-gray-800/80 border-gray-700/60 rounded-lg animate-pulse" />;
            }

            if (chartData.length === 0) {
                return (
                    <Card className="mb-8 bg-gray-800/80 border-gray-700/60">
                        <CardHeader>
                            <CardTitle className="text-white">Performance Radar</CardTitle>
                        </CardHeader>
                        <CardContent className="h-96 flex items-center justify-center">
                            <p className="text-gray-400">Not enough comparable data to display chart.</p>
                        </CardContent>
                    </Card>
                );
            }
        
            return (
                <Card className="mb-8 bg-gray-800/80 border-gray-700/60">
                    <CardHeader>
                        <CardTitle className="text-white">Performance Radar</CardTitle>
                    </CardHeader>
                    <CardContent className="h-96">
                    {isClient && (
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'white', fontSize: 14 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Prompt 1" dataKey="A" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.6} />
                                <Radar name="Prompt 2" dataKey="B" stroke="#34d399" fill="#34d399" fillOpacity={0.6} />
                                <Legend wrapperStyle={{ color: 'white' }} />
                                <RechartsTooltip
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(20, 20, 20, 0.8)', 
                                        borderColor: '#555',
                                        color: '#fff'
                                    }}
                                    labelStyle={{ color: '#fff' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    )}
                    </CardContent>
                </Card>
            )
        }

        const ComparisonTable = () => {
            if (!promptsToCompare || promptsToCompare.length === 0) return null;

            const metrics = ['Score', 'Latency', 'Tokens', 'Hallucination', 'Emotional', 'CTA Score'];
            
            const isMetricBest = (prompt: PromptHistory, metric: string) => {
                const lowerIsBetter = ['Latency', 'Hallucination'];
                const allValues = promptsToCompare.map(p => {
                    let pd: { prompt?: string; output?: string; latency?: number; tokens?: number } | null = null;
                    try { pd = JSON.parse(p.prompt_text); } catch (e) { /* Not a JSON object */ }
                    switch (metric) {
                        case 'Score': return p.score;
                        case 'Latency': return pd?.latency;
                        case 'Tokens': return pd?.tokens;
                        case 'Hallucination': return p.hallucination_score;
                        case 'Emotional': return p.emotional_score;
                        case 'CTA Score': return p.cta_score;
                        default: return null;
                    }
                }).filter(v => v !== null && v !== undefined) as number[];

                if (allValues.length < 2) return false;
                
                const currentValue = getMetricValue(prompt, metric);
                if (currentValue === 'N/A' || currentValue === undefined) return false;
                
                const numericValue = parseFloat(String(currentValue).replace('ms', ''));

                if (lowerIsBetter.includes(metric)) {
                    return numericValue === Math.min(...allValues);
                } else {
                    return numericValue === Math.max(...allValues);
                }
            };

            return (
                <Card className="mb-8 bg-gray-800/80 border-gray-700/60">
                    <CardHeader>
                        <CardTitle className="text-white">Comparison Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-gray-700">
                                    <TableHead className="text-white font-semibold">Metric</TableHead>
                                    {promptsToCompare.map((p, index) => (
                                        <TableHead key={p.id} className="text-center text-white font-semibold">Prompt {index + 1}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {metrics.map(metric => (
                                    <TableRow key={metric} className="border-gray-700">
                                        <TableCell className="font-medium text-gray-300">{metric}</TableCell>
                                        {promptsToCompare.map(p => {
                                            const isBest = isMetricBest(p, metric);
                                            return (
                                                <TableCell key={p.id} className={`text-center font-semibold ${isBest ? 'text-emerald-400' : 'text-white'}`}>
                                                    <div className="flex items-center justify-center gap-2">
                                                        {getMetricValue(p, metric) || 'N/A'}
                                                        {isBest && <Trophy className="w-4 h-4 text-emerald-400" />}
                                                    </div>
                                                </TableCell>
                                            )
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            );
        };
        
        return (
            <div>
                <Button onClick={() => setShowComparison(false)} variant="outline" className="mb-8 bg-transparent text-white border-gray-600 hover:bg-gray-700 hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    New Comparison
                </Button>
                <ComparisonChart />
                <ComparisonTable />
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-start`}>
                    {promptsToCompare.map((prompt, index) => {
                        let promptData: { prompt?: string; output?: string; latency?: number; tokens?: number } | null = null;
                        try {
                            const parsed = JSON.parse(prompt.prompt_text);
                            if(parsed && typeof parsed === 'object') {
                                promptData = parsed;
                            }
                        } catch (e) { /* Not a JSON object */ }

                        return (
                            <Card key={prompt.id} className={`bg-gray-800/80 border shadow-2xl transition-all duration-300 ${prompt.is_best ? 'border-emerald-500/80 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'border-gray-700/60'}`}>
                                <CardHeader className="pb-4">
                                    {prompt.is_best && (
                                        <Badge className="bg-gradient-to-r from-emerald-500/30 to-green-500/30 text-white border-emerald-500/50 w-fit animate-pulse">
                                            <Trophy className="w-4 h-4 mr-2" />
                                            Best Overall
                                        </Badge>
                                    )}
                                    <CardTitle className="text-white text-xl pt-2">Prompt {index + 1}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        {promptData?.prompt ? (
                                            <>
                                                <div>
                                                    <h4 className="text-base font-semibold text-white mb-2">Prompt</h4>
                                                    <p className="text-gray-200 text-base bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                                                        {promptData.prompt}
                                                    </p>
                                                </div>
                                                {promptData.output && (
                                                     <div>
                                                        <h4 className="text-base font-semibold text-white mb-2">Example Output</h4>
                                                        <p className="text-gray-200 text-base bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                                                            {promptData.output}
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div>
                                                <h4 className="text-base font-semibold text-white mb-2">Prompt</h4>
                                                <p className="text-gray-200 text-base bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                                                    {prompt.prompt_text}
                                                </p>
                                            </div>
                                        )}
                                        {prompt.response_text && (
                                            <div>
                                                <h4 className="text-base font-semibold text-white mb-2">Final Response</h4>
                                                <p className="text-gray-200 text-base bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                                                    {prompt.response_text}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 mt-4 border-t border-gray-700/50">
                                        <h4 className="text-base font-semibold text-white mb-3 flex items-center gap-2"><BarChart className="w-5 h-5" /> Metrics</h4>
                                        <TooltipProvider>
                                            <div className="grid grid-cols-1 gap-3">
                                                {promptData?.latency !== undefined && (
                                                    <div className="flex justify-between items-center text-sm"><span className="text-gray-400">Latency</span> <span className="font-semibold text-white">{promptData.latency}ms</span></div>
                                                )}
                                                {promptData?.tokens !== undefined && (
                                                    <div className="flex justify-between items-center text-sm"><span className="text-gray-400">Tokens</span> <span className="font-semibold text-white">{promptData.tokens}</span></div>
                                                )}
                                                {prompt.hallucination_score !== null && (
                                                    <div className="flex justify-between items-center text-sm">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="text-gray-400 cursor-help">Hallucination</span>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="bg-gray-950 border-gray-700 text-white"><p>0 is good, 1 is bad</p></TooltipContent>
                                                        </Tooltip>
                                                        <span className={`font-semibold ${getScoreColor(prompt.hallucination_score)}`}>{prompt.hallucination_score.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                 {prompt.emotional_score !== null && (
                                                    <div className="flex justify-between items-center text-sm"><span className="text-gray-400">Emotional</span> <span className={`font-semibold ${getScoreColor(prompt.emotional_score)}`}>{prompt.emotional_score.toFixed(2)}</span></div>
                                                )}
                                                {prompt.cta_score !== null && (
                                                    <div className="flex justify-between items-center text-sm"><span className="text-gray-400">CTA Score</span> <span className={`font-semibold ${getScoreColor(prompt.cta_score)}`}>{prompt.cta_score.toFixed(2)}</span></div>
                                                )}
                                            </div>
                                        </TooltipProvider>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        )
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
            <Navbar />
            <div className="container mx-auto px-6 py-12">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Scale className="w-9 h-9 text-purple-400" />
                        <h2 className="text-4xl font-extrabold text-white drop-shadow-lg">A/B Test Results</h2>
                    </div>
                    <p className="text-gray-200 text-xl">{experimentName || 'No experiment selected'}</p>
                </div>
                
                {loading && !allPrompts.length ? (
                    <div className="flex justify-center items-center h-64"><div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" /></div>
                ) : showComparison ? (
                    <ComparisonView promptsToCompare={selectedPrompts} />
                ) : (
                    <div>
                        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                            <h3 className="font-semibold text-white mb-2">Select Two Prompts to Compare</h3>
                            <p className="text-gray-300 text-sm">Choose any two prompts from the list below to see a detailed, side-by-side comparison of their performance.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            {allPrompts.map((prompt, index) => {
                                let promptTextForDisplay = prompt.prompt_text;
                                try {
                                    const parsed = JSON.parse(prompt.prompt_text);
                                    if (parsed && typeof parsed === 'object' && parsed.prompt) {
                                        promptTextForDisplay = parsed.prompt;
                                    }
                                } catch (e) { /* Not a JSON object */ }
                                
                                return (
                                <div key={prompt.id} onClick={() => handleSelectPrompt(prompt)} className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedPrompts.some(p => p.id === prompt.id) ? 'bg-blue-500/20 border-blue-500' : 'bg-gray-800/80 border-gray-700 hover:border-gray-600'}`}>
                                    <div className="flex items-start gap-4">
                                        <Checkbox
                                            checked={selectedPrompts.some(p => p.id === prompt.id)}
                                            onCheckedChange={() => handleSelectPrompt(prompt)}
                                            id={`prompt-${prompt.id}`}
                                            aria-label={`Select prompt ${index + 1}`}
                                            className="mt-1"
                                        />
                                        <div>
                                            <h4 className="font-semibold text-white">Prompt {index + 1}</h4>
                                            <p className="text-sm text-gray-400 line-clamp-2 mt-1">{promptTextForDisplay}</p>
                                        </div>
                                    </div>
                                </div>
                            )})}
                        </div>
                        <Button onClick={() => setShowComparison(true)} disabled={selectedPrompts.length !== 2} className="w-full md:w-auto">
                            Compare ({selectedPrompts.length}/2)
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

const ABTestPage = () => (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex justify-center items-center"><div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" /></div>}>
      <ABTestDisplay />
    </Suspense>
);
  
export default ABTestPage; 