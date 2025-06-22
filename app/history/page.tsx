"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/ui/navigation-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, User, Target, Trophy, Brain, Zap, FileText, BarChart, Smile, AlertTriangle } from "lucide-react";

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

const History = () => {
  const { user } = useAuth();
  const [promptHistory, setPromptHistory] = useState<PromptHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchPromptHistory = async () => {
      setLoading(true);
      if (!user) return;
      
      const { data, error } = await supabase
        .from('prompt_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching prompt history:', error);
      }
      
      setPromptHistory((data || []) as unknown as PromptHistory[]);
      setLoading(false);
    };
    fetchPromptHistory();
  }, [user]);

  const toggleExpanded = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-gray-400";
    if (score >= 0.8) return "text-emerald-400";
    if (score >= 0.6) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBadge = (score: number | null) => {
    if (score === null) return "bg-gray-500/20 text-gray-400";
    if (score >= 0.8) return "bg-emerald-500/20 text-emerald-400";
    if (score >= 0.6) return "bg-yellow-500/20 text-yellow-400";
    return "bg-red-500/20 text-red-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <Navbar />
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Prompt History
          </h2>
          <p className="text-gray-200 text-xl">Your experiment and prompt optimization history</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-10 h-10 border-4 border-emerald-400 border-t-blue-400 border-b-transparent border-l-transparent rounded-full animate-spin" />
            <span className="ml-4 text-emerald-200">Loading your history...</span>
          </div>
        ) : promptHistory.length === 0 ? (
          <div className="text-center mt-20">
            <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl text-white mb-2">No prompt history found</h3>
            <p className="text-gray-400">Start experimenting with prompts to see your history here.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {promptHistory.map((item) => {
              let promptData: { prompt?: string; output?: string; latency?: number; tokens?: number } | null = null;
              try {
                const parsed = JSON.parse(item.prompt_text);
                if(parsed && typeof parsed === 'object' && parsed.prompt) {
                  promptData = parsed;
                }
              } catch (e) {
                // not a json
              }

              return (
                <Card key={item.id} className="bg-gradient-to-br from-gray-800/80 via-gray-700/80 to-gray-800/80 border border-gray-600/50 shadow-xl hover:shadow-2xl hover:border-emerald-500/30 transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-gray-100 text-xl line-clamp-2">
                            {item.experiment_name || 'Untitled Experiment'}
                          </CardTitle>
                          {item.is_best && (
                            <Badge className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 text-emerald-400 border-emerald-500/30">
                              <Trophy className="w-3 h-3 mr-1" />
                              Best
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-base text-gray-300">
                          <div className="flex items-center gap-1">
                            <Clock className="w-5 h-5" />
                            {item.created_at ? new Date(item.created_at).toLocaleString() : 'Unknown'}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-5 h-5" />
                            {item.user_id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={`${getScoreBadge(item.score)} text-base`}>
                          Score: {item.score !== null ? item.score.toFixed(2) : 'N/A'}
                        </Badge>
                      </div>
                    </div>
                </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {promptData ? (
                        <>
                          <div>
                            <h4 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                              <Target className="w-5 h-5" />
                              Prompt
                            </h4>
                            <p className={`text-gray-200 text-base bg-gray-900/50 p-3 rounded-lg border border-gray-700/50 ${!expanded[item.id] && 'line-clamp-3'}`}>
                              {promptData.prompt}
                            </p>
                          </div>
                          {promptData.output && (
                            <div>
                              <h4 className="text-base font-semibold text-white mb-2">Example Output</h4>
                              <p className={`text-gray-200 text-base bg-gray-900/50 p-3 rounded-lg border border-gray-700/50 ${!expanded[item.id] && 'line-clamp-3'}`}>
                                {promptData.output}
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div>
                          <h4 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            Prompt
                          </h4>
                          <p className={`text-gray-200 text-base bg-gray-900/50 p-3 rounded-lg border border-gray-700/50 ${!expanded[item.id] && 'line-clamp-3'}`}>
                            {item.prompt_text}
                          </p>
                        </div>
                      )}
                      
                      {item.response_text && (
                        <div>
                          <h4 className="text-base font-semibold text-white mb-2">Final Response</h4>
                          <p className={`text-gray-200 text-base bg-gray-900/50 p-3 rounded-lg border border-gray-700/50 ${!expanded[item.id] && 'line-clamp-3'}`}>
                            {item.response_text}
                          </p>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => toggleExpanded(item.id)} 
                      className="text-base text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      {expanded[item.id] ? 'Show Less' : 'Show More'}
                    </button>
                    
                    <div className="pt-4 mt-4 border-t border-gray-700/50">
                      <h4 className="text-base font-semibold text-white mb-3 flex items-center gap-2"><BarChart className="w-5 h-5" /> Metrics</h4>
                      <TooltipProvider>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {promptData?.latency !== undefined && (
                                <div className="text-center p-2 bg-gray-900/30 rounded-lg">
                                  <div className="text-sm text-gray-400 mb-1 flex items-center justify-center gap-1"><Zap className="w-4 h-4"/> Latency</div>
                                  <div className="font-semibold text-white">{promptData.latency}ms</div>
                                </div>
                            )}
                            {promptData?.tokens !== undefined && (
                                <div className="text-center p-2 bg-gray-900/30 rounded-lg">
                                  <div className="text-sm text-gray-400 mb-1 flex items-center justify-center gap-1"><FileText className="w-4 h-4"/> Tokens</div>
                                  <div className="font-semibold text-white">{promptData.tokens}</div>
                                </div>
                            )}
                            {item.hallucination_score !== null && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="text-center p-2 bg-gray-900/30 rounded-lg cursor-help">
                                    <div className="text-sm text-gray-400 mb-1 flex items-center justify-center gap-1"><AlertTriangle className="w-4 h-4"/> Hallucination</div>
                                    <div className={`font-semibold ${getScoreColor(item.hallucination_score)}`}>
                                      {item.hallucination_score.toFixed(2)}
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-gray-950 border-gray-700 text-white">
                                  <p>0 is good, 1 is bad</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            {item.emotional_score !== null && (
                              <div className="text-center p-2 bg-gray-900/30 rounded-lg">
                                <div className="text-sm text-gray-400 mb-1 flex items-center justify-center gap-1"><Smile className="w-4 h-4"/> Emotional</div>
                                <div className={`font-semibold ${getScoreColor(item.emotional_score)}`}>
                                  {item.emotional_score.toFixed(2)}
                                </div>
                              </div>
                            )}
                            {item.cta_score !== null && (
                              <div className="text-center p-2 bg-gray-900/30 rounded-lg">
                                <div className="text-sm text-gray-400 mb-1 flex items-center justify-center gap-1"><Target className="w-4 h-4"/> CTA</div>
                                <div className={`font-semibold ${getScoreColor(item.cta_score)}`}>
                                  {item.cta_score.toFixed(2)}
                                </div>
                              </div>
                            )}
                        </div>
                      </TooltipProvider>
                      
                      {item.cta_reason && (
                        <div className="mt-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-3 rounded-lg border border-blue-500/20">
                          <div className="text-sm text-blue-300 font-medium mb-1">CTA Analysis</div>
                          <p className="text-gray-200 text-base">{item.cta_reason}</p>
                        </div>
                      )}
                    </div>
                </CardContent>
              </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default History; 