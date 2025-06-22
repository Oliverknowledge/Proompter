"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Zap, 
  Target, 
  TrendingUp, 
  History, 
  Play, 
  Pause, 
  RotateCcw,
  Trophy,
  Brain,
  BarChart3,
  Users,
  Clock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/supabase/client";
import { Navbar } from "@/components/ui/navigation-menu";

interface OptimizationRun {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'cancelled';
  num_trials: number;
  created_at: string;
  updated_at: string;
  experiment_name: string;
  metadata?: Record<string, unknown>;
}

interface PromptHistory {
  id: string;
  prompt_text: string;
  score: number | null;
  experiment_name: string | null;
  created_at: string | null;
  is_best: boolean | null;
  hallucination_score: number | null;
  emotional_score: number | null;
  cta_score: number | null;
}

const OptimizePage = () => {
  const { user } = useAuth();
  const [optimizationRuns, setOptimizationRuns] = useState<OptimizationRun[]>([]);
  const [promptHistory, setPromptHistory] = useState<PromptHistory[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const [taskDescription, setTaskDescription] = useState<string>("");
  const [expectedOutput, setExpectedOutput] = useState<string>("");
  const [optimizationName, setOptimizationName] = useState<string>("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [currentRun, setCurrentRun] = useState<OptimizationRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizationMessage, setOptimizationMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    
    // Fetch optimization runs
    const { data: runs } = await supabase
      .from('optimization_runs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    setOptimizationRuns((runs || []) as OptimizationRun[]);

    // Fetch prompt history for selection
    const { data: history } = await supabase
      .from('prompt_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    
    setPromptHistory(history || []);
    setLoading(false);
  };

  const startOptimization = async () => {
    if (!selectedPrompt || !taskDescription || !user) return;

    setIsOptimizing(true);
    setOptimizationMessage({ type: 'info', text: 'Starting optimization...' });
    
    try {
      // Get team code from user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('team_code')
        .eq('id', user.id)
        .single();

      setOptimizationMessage({ type: 'info', text: 'Running Opik optimization...' });

      // Use the new optimization-runs API to run optimization
      const response = await fetch('/api/optimization-runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: optimizationName || 'Prompt Optimization',
          task: taskDescription,
          expectedOutput,
          user_id: user.id,
          team_code: profile?.team_code || null,
          experimentName: optimizationName || 'Prompt Optimization',
          selectedPrompt,
          action: 'run' // This will create the run and execute optimization
        })
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Set current run for UI feedback
      setCurrentRun(result.optimizationRun);

      // Show success message
      setOptimizationMessage({ 
        type: 'success', 
        text: `Optimization completed! Generated ${result.trials?.length || 0} variations with best score: ${result.best_score?.toFixed(3) || 'N/A'}` 
      });

      // Refresh data to show updated optimization runs
      await fetchData();
      
    } catch (error) {
      console.error('Optimization failed:', error);
      setOptimizationMessage({ 
        type: 'error', 
        text: `Optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setIsOptimizing(false);
      setCurrentRun(null);
      
      // Clear message after 5 seconds
      setTimeout(() => setOptimizationMessage(null), 5000);
    }
  };

  const generatePromptVariations = async (originalPrompt: string, task: string): Promise<string[]> => {
    // Generate variations using AI
    const variations = [
      originalPrompt,
      `${originalPrompt}\n\nPlease be more specific.`,
      `${originalPrompt}\n\nFocus on actionable insights.`,
      `${originalPrompt}\n\nUse a friendly tone.`,
    ];

    return variations;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-500/20 text-blue-400';
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="w-4 h-4" />;
      case 'completed': return <Trophy className="w-4 h-4" />;
      case 'cancelled': return <Pause className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Prompt Optimization</h1>
          <p className="text-gray-400 text-lg">
            Continuously improve your prompts through iterative optimization
          </p>
        </div>

        <Tabs defaultValue="new" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="new" className="text-white">New Optimization</TabsTrigger>
            <TabsTrigger value="history" className="text-white">Optimization History</TabsTrigger>
          </TabsList>

          {/* Optimization Message Display */}
          {optimizationMessage && (
            <div className={`p-4 rounded-lg border ${
              optimizationMessage.type === 'success' 
                ? 'bg-green-500/20 border-green-500 text-green-400'
                : optimizationMessage.type === 'error'
                ? 'bg-red-500/20 border-red-500 text-red-400'
                : 'bg-blue-500/20 border-blue-500 text-blue-400'
            }`}>
              <div className="flex items-center gap-2">
                {optimizationMessage.type === 'success' && <Trophy className="w-4 h-4" />}
                {optimizationMessage.type === 'error' && <Pause className="w-4 h-4" />}
                {optimizationMessage.type === 'info' && <Clock className="w-4 h-4" />}
                {optimizationMessage.text}
              </div>
            </div>
          )}

          <TabsContent value="new" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Setup */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Setup Optimization
                  </CardTitle>
                  <CardDescription>
                    Select a prompt and configure your optimization parameters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Form fields */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="opt-name" className="text-gray-300">Optimization Name</Label>
                      <Input 
                        id="opt-name"
                        placeholder="e.g., Customer Support AI V2" 
                        className="bg-gray-700 border-gray-600 text-white"
                        value={optimizationName}
                        onChange={(e) => setOptimizationName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="task-desc" className="text-gray-300">Task Description</Label>
                      <Textarea 
                        id="task-desc"
                        placeholder="Describe the main goal of the prompt, e.g., 'Generate a friendly and helpful response to a customer query about billing.'" 
                        className="bg-gray-700 border-gray-600 text-white"
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="exp-output" className="text-gray-300">Expected Output</Label>
                      <Textarea 
                        id="exp-output"
                        placeholder="Provide an ideal example of what the AI should generate. This will be used as a benchmark."
                        className="bg-gray-700 border-gray-600 text-white"
                        value={expectedOutput}
                        onChange={(e) => setExpectedOutput(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Select Base Prompt</Label>
                      <div className="max-h-60 overflow-y-auto space-y-2 p-2 bg-gray-900/50 rounded-lg">
                        {promptHistory.map(p => (
                          <div
                            key={p.id}
                            onClick={() => setSelectedPrompt(p.prompt_text)}
                            className={`p-3 rounded-lg cursor-pointer transition-all ${
                              selectedPrompt === p.prompt_text 
                                ? 'bg-emerald-500/30 ring-2 ring-emerald-500' 
                                : 'bg-gray-700/50 hover:bg-gray-700'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <p className="text-sm text-gray-200 break-all">
                                {p.experiment_name || "Untitled"}
                              </p>
                              {p.is_best && <Badge variant="secondary" className="bg-green-500 text-white">Best</Badge>}
                            </div>
                            <p className="text-xs text-gray-400 mt-1 truncate">
                              {`"${p.prompt_text.substring(0, 50)}..."`}
                            </p>
                            
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      onClick={startOptimization}
                      disabled={isOptimizing || !selectedPrompt || !taskDescription}
                    >
                      {isOptimizing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Optimizing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Start Optimization
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Right Column - Progress */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Optimization Progress
                  </CardTitle>
                  <CardDescription>
                    Track your optimization progress and results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentRun ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg text-white">{currentRun.name}</h3>
                        <Badge className={getStatusColor(currentRun.status)}>
                          {getStatusIcon(currentRun.status)}
                          <span className="ml-1">{currentRun.status}</span>
                        </Badge>
                      </div>
                      
                      <Progress value={(currentRun.metadata?.progress as number) || 0} className="w-full" />
                      
                      <div className="text-sm text-gray-400">
                        <p>Progress: {((currentRun.metadata?.progress as number) || 0).toFixed(0)}%</p>
                        <p>Best Score: {(currentRun.metadata?.best_score as number)?.toFixed(3) || 'N/A'}</p>
                        <p>Trials: {currentRun.metadata?.trials_completed || 0} / {currentRun.num_trials}</p>
                      </div>

                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-16">
                      <Brain className="w-16 h-16 mx-auto mb-4" />
                      <p>Start an optimization run to see progress here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Optimization Runs
                </CardTitle>
                <CardDescription>
                  Review your past optimization jobs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {optimizationRuns.map(run => (
                    <div key={run.id} className="p-4 bg-gray-900/50 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-white">{run.name}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(run.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(run.status)}>
                        {getStatusIcon(run.status)}
                        <span className="ml-1">{run.status}</span>
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OptimizePage;