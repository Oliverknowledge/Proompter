"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/ui/navigation-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, User, Target, Trophy, Brain, Users, TrendingUp, AlertTriangle, Smile, Zap, FileText, BarChart } from "lucide-react";

interface PromptTest {
  id: string;
  prompt_text: string;
  response_text: string | null;
  user_id: string;
  created_at: string | null;
  score?: number;
  experiment_name?: string | null;
  hallucination_score?: number | null;
  emotional_score?: number | null;
  cta_score?: number | null;
  cta_reason?: string | null;
  is_best?: boolean | null;
}

const TeamPromptTests = () => {
  const { user } = useAuth();
  const [promptTests, setPromptTests] = useState<PromptTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamCode, setTeamCode] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchTeamCodeAndPromptTests = async () => {
      setLoading(true);
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('team_code')
        .eq('id', user.id)
        .single();
      const code = profile?.team_code;
      if (code) setTeamCode(code);
      if (!code) {
        setPromptTests([]);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('prompt_history')
        .select('*')
        .eq('team_code', code)
        .order('created_at', { ascending: false });
    if (data){
      setPromptTests(
        data.map((item) => ({
          ...item,
          score: item.score === null ? undefined : item.score,
        }))
      );
    }
      setLoading(false);
    };
    fetchTeamCodeAndPromptTests();
  }, [user]);

  const toggleExpanded = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getScoreColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) return "text-gray-400";
    if (score >= 0.8) return "text-emerald-400";
    if (score >= 0.6) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBadge = (score: number | null | undefined) => {
    if (score === null || score === undefined) return "bg-gray-500/20 text-gray-400";
    if (score >= 0.8) return "bg-emerald-500/20 text-emerald-400";
    if (score >= 0.6) return "bg-yellow-500/20 text-yellow-400";
    return "bg-red-500/20 text-red-400";
  };

  const getBestPromptCount = () => {
    return promptTests.filter(test => test.is_best).length;
  };

  const getAverageScore = () => {
    const scores = promptTests.map(test => test.score).filter(score => score !== null && score !== undefined);
    if (scores.length === 0) return 0;
    return scores.reduce((sum, score) => sum + (score || 0), 0) / scores.length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <Navbar />
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-9 h-9 text-blue-300" />
            <h2 className="text-5xl font-extrabold text-white drop-shadow-lg">
              Team Prompt Tests
            </h2>
          </div>
          <p className="text-gray-200 text-xl">Collaborative prompt optimization and testing</p>
          {teamCode && (
            <div className="mt-4 flex items-center gap-4">
              <Badge className="bg-blue-600/30 text-white border-blue-400/40 font-semibold text-base">
                Team: {teamCode}
              </Badge>
              <div className="flex items-center gap-6 text-base text-gray-100">
                <div className="flex items-center gap-1">
                  <Trophy className="w-5 h-5 text-yellow-300" />
                  {getBestPromptCount()} Best Prompts
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-5 h-5 text-emerald-300" />
                  Avg Score: {getAverageScore().toFixed(2)}
                </div>
              </div>
              <button className="ml-auto px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold shadow transition-all duration-200 text-base">View All</button>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-10 h-10 border-4 border-blue-400 border-t-purple-400 border-b-transparent border-l-transparent rounded-full animate-spin" />
            <span className="ml-4 text-blue-200">Loading team data...</span>
          </div>
        ) : promptTests.length === 0 ? (
          <div className="text-center mt-20">
            <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl text-white mb-2">No team prompt tests found</h3>
            <p className="text-gray-400 text-lg">Start collaborating with your team to see shared prompt tests here.</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {promptTests.map((test) => {
              let promptData: { prompt?: string; output?: string; latency?: number; tokens?: number } | null = null;
              try {
                const parsed = JSON.parse(test.prompt_text);
                if(parsed && typeof parsed === 'object' && parsed.prompt) {
                  promptData = parsed;
                }
              } catch (e) {
                // not a json
              }

              return (
              <Card key={test.id} className="bg-gray-800/90 border border-gray-600/60 shadow-2xl hover:shadow-blue-500/20 hover:border-blue-400/40 transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-white text-xl font-bold line-clamp-2">
                          {test.experiment_name || 'Untitled Experiment'}
                        </CardTitle>
                        {test.is_best && (
                          <Badge className="bg-gradient-to-r from-yellow-400/30 to-orange-400/30 text-yellow-200 border-yellow-400/30 font-semibold">
                            <Trophy className="w-4 h-4 mr-1" />
                            Best
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-base text-gray-200">
                        <div className="flex items-center gap-1">
                          <Clock className="w-5 h-5" />
                          {test.created_at ? new Date(test.created_at).toLocaleString() : 'Unknown'}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-5 h-5" />
                          {test.user_id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`${getScoreBadge(test.score)} font-bold text-white text-base`}>
                        Score: {test.score !== null && test.score !== undefined ? test.score.toFixed(2) : 'N/A'}
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
                            <p className={`text-white text-base bg-gray-900/70 p-3 rounded-lg border border-gray-700/50 ${!expanded[test.id] && 'line-clamp-3'}`}>
                              {promptData.prompt}
                            </p>
                          </div>
                          {promptData.output && (
                            <div>
                              <h4 className="text-base font-semibold text-white mb-2">Example Output</h4>
                              <p className={`text-white text-base bg-gray-900/70 p-3 rounded-lg border border-gray-700/50 ${!expanded[test.id] && 'line-clamp-3'}`}>
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
                          <p className={`text-white text-base bg-gray-900/70 p-3 rounded-lg border border-gray-700/50 ${!expanded[test.id] && 'line-clamp-3'}`}>
                            {test.prompt_text}
                          </p>
                        </div>
                      )}
                      
                      {test.response_text && (
                        <div>
                          <h4 className="text-base font-semibold text-white mb-2">Final Response</h4>
                          <p className={`text-white text-base bg-gray-900/70 p-3 rounded-lg border border-gray-700/50 ${!expanded[test.id] && 'line-clamp-3'}`}>
                            {test.response_text}
                          </p>
                        </div>
                      )}
                  </div>
                  
                  <button 
                    onClick={() => toggleExpanded(test.id)} 
                    className="text-base text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    {expanded[test.id] ? 'Show Less' : 'Show More'}
                  </button>

                  <div className="pt-4 mt-4 border-t border-gray-700/50">
                    <h4 className="text-base font-semibold text-gray-300 mb-3 flex items-center gap-2"><BarChart className="w-5 h-5" /> Metrics</h4>
                    <TooltipProvider>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {promptData?.latency !== undefined && (
                            <div className="text-center p-2 bg-gray-900/30 rounded-lg">
                              <div className="text-sm text-gray-500 mb-1 flex items-center justify-center gap-1"><Zap className="w-4 h-4"/> Latency</div>
                              <div className="font-semibold text-gray-200">{promptData.latency}ms</div>
                            </div>
                        )}
                        {promptData?.tokens !== undefined && (
                            <div className="text-center p-2 bg-gray-900/30 rounded-lg">
                              <div className="text-sm text-gray-500 mb-1 flex items-center justify-center gap-1"><FileText className="w-4 h-4"/> Tokens</div>
                              <div className="font-semibold text-gray-200">{promptData.tokens}</div>
                            </div>
                        )}
                        {test.hallucination_score !== null && test.hallucination_score !== undefined && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="text-center p-2 bg-gray-900/40 rounded-lg cursor-help">
                                <div className="text-sm text-gray-300 mb-1 flex items-center justify-center gap-1"><AlertTriangle className="w-4 h-4" /> Hallucination</div>
                                <div className={`font-semibold ${getScoreColor(test.hallucination_score)} text-white`}>
                                  {test.hallucination_score.toFixed(2)}
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>0 is good, 1 is bad</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {test.emotional_score !== null && test.emotional_score !== undefined && (
                          <div className="text-center p-2 bg-gray-900/40 rounded-lg">
                            <div className="text-sm text-gray-300 mb-1 flex items-center justify-center gap-1"><Smile className="w-4 h-4" /> Emotional</div>
                            <div className={`font-semibold ${getScoreColor(test.emotional_score)} text-white`}>
                              {test.emotional_score.toFixed(2)}
                            </div>
                          </div>
                        )}
                        {test.cta_score !== null && test.cta_score !== undefined && (
                          <div className="text-center p-2 bg-gray-900/40 rounded-lg">
                            <div className="text-sm text-gray-300 mb-1 flex items-center justify-center gap-1"><Target className="w-4 h-4" /> CTA</div>
                            <div className={`font-semibold ${getScoreColor(test.cta_score)} text-white`}>
                              {test.cta_score.toFixed(2)}
                            </div>
                          </div>
                        )}
                    </div>
                    </TooltipProvider>
                    
                    {test.cta_reason && (
                      <div className="mt-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-3 rounded-lg border border-purple-500/30">
                        <div className="text-sm text-purple-200 font-medium mb-1">CTA Analysis</div>
                        <p className="text-white text-base">{test.cta_reason}</p>
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

export default TeamPromptTests; 