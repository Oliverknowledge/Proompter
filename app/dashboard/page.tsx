"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BarChart3, Clock, Users, Zap, ArrowRight, Star, TrendingUp, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Navbar } from "@/components/ui/navigation-menu";
import { Input } from "@/components/ui/input";
import { supabase } from "@/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

interface RecentExperiment {
  experiment_name: string;
  latest_created_at: string;
  prompt_count: number;
}

interface PromptTest {
  id: string;
  prompt_text: string;
  user_id: string;
  created_at: string | null;
  score?: number;
}

interface Experiment {
  id: string;
  name: string;
  user_id: string;
  created_at: string | null;
}

interface Teammate {
  id: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [recentExperiments, setRecentExperiments] = useState<RecentExperiment[]>([]);
  const [promptTests, setPromptTests] = useState<PromptTest[]>([]);
  const [teammates, setTeammates] = useState<Teammate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (!user) return;
      
      // Fetch user's prompt tests
      const { data: prompts, error: promptsError } = await supabase
        .from('prompt_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (promptsError) {
        console.error("Error fetching prompt tests:", promptsError);
        setPromptTests([]);
        setRecentExperiments([]);
      } else {
        console.log("Fetched prompts from Supabase:", prompts);
        const tests = (prompts || []).map((item) => ({
          ...item,
          score: item.score === null ? undefined : item.score,
        }));
        setPromptTests(tests);

        // Group prompts by experiment_name to create recent experiments list
        const experimentsMap = new Map<string, { prompt_count: number, latest_created_at: string }>();
        prompts?.forEach(p => {
          const name = p.experiment_name || 'Untitled Experiment';
          if (!p.created_at) return; // Skip if created_at is null

          if (!experimentsMap.has(name)) {
            experimentsMap.set(name, { prompt_count: 0, latest_created_at: p.created_at });
          }
          const current = experimentsMap.get(name)!;
          current.prompt_count += 1;
          if (new Date(p.created_at) > new Date(current.latest_created_at)) {
            current.latest_created_at = p.created_at;
          }
        });

        console.log("Grouped experiments map:", experimentsMap);

        const sortedExperiments: RecentExperiment[] = Array.from(experimentsMap.entries())
          .map(([name, { prompt_count, latest_created_at }]) => ({
            experiment_name: name,
            prompt_count,
            latest_created_at
          }))
          .sort((a, b) => new Date(b.latest_created_at).getTime() - new Date(a.latest_created_at).getTime());

        setRecentExperiments(sortedExperiments);
        console.log("Final sorted experiments state:", sortedExperiments);
      }
      
      // Fetch teammates if user is in a team
      const { data: profile } = await supabase
        .from('profiles')
        .select('team_code')
        .eq('id', user.id)
        .single();
      if (profile?.team_code) {
        const { data: mates } = await supabase
          .from('profiles')
          .select('id')
          .eq('team_code', profile.team_code);
        setTeammates(mates || []);
      } else {
        setTeammates([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  // Metrics
  const totalExperiments = recentExperiments.length;
  const totalPrompts = promptTests.length;
  const avgQualityScore = promptTests.length > 0 ? (
    promptTests.reduce((sum, p) => sum + (typeof p.score === 'number' ? p.score : 0), 0) / promptTests.length
  ).toFixed(2) : 'N/A';
  const teamSize = teammates.length;

  // Glow effect classes
  const glowCard =
    "bg-gray-800 border-gray-700 hover:shadow-[0_0_20px_4px_rgba(34,197,94,0.5)] hover:border-green-400 transition-shadow transition-colors duration-300 cursor-pointer group relative overflow-hidden";
  const glowInner =
    "absolute inset-0 pointer-events-none rounded-lg opacity-60 group-hover:opacity-100 transition duration-300";

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden z-10">
      {/* Loading Overlay */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            className="flex flex-col items-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <motion.div
              className="w-16 h-16 border-4 border-blue-400 border-t-green-400 border-b-transparent border-l-transparent rounded-full animate-spin mb-6"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
            <span className="text-lg text-blue-200 font-semibold animate-pulse">Loading dashboard...</span>
          </motion.div>
        </motion.div>
      )}
      {/* Header */}
     <Navbar/>
      <div className="container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-100 mb-2">Welcome back!</h2>
          <p className="text-gray-300">Track, compare, and optimize your AI prompts with data-driven insights.</p>
        </div>
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="bg-gray-800 border-0 shadow-lg flex flex-col items-center justify-center p-6">
            <BarChart3 className="w-8 h-8 text-blue-300 mb-2" />
            <div className="text-2xl font-bold text-gray-100">{totalExperiments}</div>
            <div className="text-sm text-gray-300">Total Experiments</div>
          </Card>
          <Card className="bg-gray-800 border-0 shadow-lg flex flex-col items-center justify-center p-6">
            <Star className="w-8 h-8 text-green-300 mb-2" />
            <div className="text-2xl font-bold text-gray-100">{avgQualityScore}</div>
            <div className="text-sm text-gray-300">Avg. Quality Score</div>
          </Card>
          <Card className="bg-gray-800 border-0 shadow-lg flex flex-col items-center justify-center p-6">
            <FileText className="w-8 h-8 text-blue-200 mb-2" />
            <div className="text-2xl font-bold text-gray-100">{totalPrompts}</div>
            <div className="text-sm text-gray-300">Active Prompts</div>
          </Card>
          <Card className="bg-gray-800 border-0 shadow-lg flex flex-col items-center justify-center p-6">
            <Users className="w-8 h-8 text-green-200 mb-2" />
            <div className="text-2xl font-bold text-gray-100">{teamSize}</div>
            <div className="text-sm text-gray-300">Team Members</div>
          </Card>
        </div>
        {/* Recent Experiments */}
        <Card className="bg-gray-800 border-0 shadow-lg mb-10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-100">Recent Experiments</CardTitle>
                <CardDescription className="text-gray-300">Your latest prompt evaluations and comparisons</CardDescription>
              </div>
              <Button className="bg-white text-gray-900" variant="default" size="sm" onClick={() => router.push('/history')}>
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentExperiments.length > 0 ? (
                recentExperiments.map((exp, index) => (
                  <motion.div
                    key={exp.experiment_name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{exp.experiment_name || 'Untitled Experiment'}</span>
                      <span className="text-sm text-gray-400">
                        {exp.prompt_count} prompts - Last run: {new Date(exp.latest_created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/ab-test?experiment=${encodeURIComponent(exp.experiment_name)}`)}>
                      View
                    </Button>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>No recent experiments to display.</p>
                  <p className="text-sm text-gray-500">Run a new experiment to see it here.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Create Experiment */}
          <Card
            className={glowCard}
            onClick={() => router.push("/experiments/new")}
          >
            <span
              className={`${glowInner} bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 blur-2xl`}
            />
            <CardContent className="p-6 text-center relative z-10">
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-100 mb-2">Create Experiment</h3>
              <p className="text-sm text-gray-300">Start a new prompt evaluation experiment</p>
            </CardContent>
          </Card>
          {/* A/B Test */}
          <Card
            className={glowCard}
            onClick={() => router.push("/experiments/new")}
          >
            <span
              className={`${glowInner} bg-gradient-to-br from-purple-400 via-pink-500 to-yellow-400 blur-2xl`}
            />
            <CardContent className="p-6 text-center relative z-10">
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-100 mb-2">A/B Test</h3>
              <p className="text-sm text-gray-300">Run batch comparisons between prompts</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
