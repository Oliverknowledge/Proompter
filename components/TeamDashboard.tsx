"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/ui/navigation-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead, TableCaption } from "@/components/ui/table";
import { supabase } from "@/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { BarChart3, Users, Star, FileText } from "lucide-react";

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
  full_name: string | null;
  email: string | null;
}

const TeamDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [teamCode, setTeamCode] = useState<string | null>(null);
  const [promptTests, setPromptTests] = useState<PromptTest[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [teammates, setTeammates] = useState<Teammate[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputCode, setInputCode] = useState("");

  // Join/Create logic
  const handleJoin = async (e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || !inputCode) return;
    await supabase.from('profiles').update({ team_code: inputCode }).eq('id', user.id);
    setTeamCode(inputCode);
    setInputCode("");
    router.push('/team'); // Force refresh
  };
  const handleCreate = async (e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.preventDefault();
    router.push('/team/create'); // Go to the create team page
  };

  useEffect(() => {
    const fetchTeamData = async () => {
      setLoading(true);
      if (!user) return;
      // Get team code
      const { data: profile } = await supabase
        .from('profiles')
        .select('team_code')
        .eq('id', user.id)
        .single();
      const code = profile?.team_code;
      setTeamCode(code);
      if (!code) {
        setPromptTests([]);
        setExperiments([]);
        setTeammates([]);
        setLoading(false);
        return;
      }
      // Fetch prompt tests
      const { data: prompts } = await supabase
        .from('prompt_history')
        .select('id, prompt_text, user_id, created_at, score')
        .eq('team_code', code)
        .order('created_at', { ascending: false });
      setPromptTests(prompts || []);
      // Fetch experiments
      const { data: exps } = await supabase
        .from('experiments')
        .select('id, name, user_id, created_at')
        .eq('team_code', code)
        .order('created_at', { ascending: false });
      setExperiments(exps || []);
      // Fetch teammates
      const { data: mates } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('team_code', code);
      setTeammates(mates || []);
      setLoading(false);
    };
    fetchTeamData();
  }, [user, teamCode]);

  // Calculate metrics
  const totalExperiments = experiments.length;
  const totalPrompts = promptTests.length;
  const avgQualityScore = promptTests.length > 0 ? (
    promptTests.reduce((sum, p) => sum + (typeof p.score === 'number' ? p.score : 0), 0) / promptTests.length
  ).toFixed(2) : 'N/A';
  const teamSize = teammates.length;

  return (
    <div className="relative min-h-screen w-full bg-gray-900 overflow-hidden">
      <Navbar />
      <div className="container mx-auto px-6 py-12">
        <div className="flex justify-end mb-6">
          
        </div>
        <h2 className="text-3xl font-bold text-green-300 mb-8">Team Dashboard</h2>
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <Card className="flex flex-col items-center justify-center p-6 bg-gray-800 border-0 shadow-sm">
            <BarChart3 className="w-8 h-8 text-blue-300 mb-2" />
            <div className="text-2xl font-bold text-blue-200">{totalExperiments}</div>
            <div className="text-sm text-gray-400">Total Experiments</div>
          </Card>
          <Card className="flex flex-col items-center justify-center p-6 bg-gray-800 border-0 shadow-sm">
            <Star className="w-8 h-8 text-green-300 mb-2" />
            <div className="text-2xl font-bold text-green-200">{avgQualityScore}</div>
            <div className="text-sm text-gray-400">Avg. Quality Score</div>
          </Card>
          <Card className="flex flex-col items-center justify-center p-6 bg-gray-800 border-0 shadow-sm">
            <FileText className="w-8 h-8 text-blue-200 mb-2" />
            <div className="text-2xl font-bold text-blue-200">{totalPrompts}</div>
            <div className="text-sm text-gray-400">Active Prompts</div>
          </Card>
          <Card className="flex flex-col items-center justify-center p-6 bg-gray-800 border-0 shadow-sm">
            <Users className="w-8 h-8 text-green-200 mb-2" />
            <div className="text-2xl font-bold text-green-200">{teamSize}</div>
            <div className="text-sm text-gray-400">Team Members</div>
          </Card>
        </div>
        {loading ? (
          <div className="text-center py-12 text-blue-400">Loading team data...</div>
        ) : !teamCode ? (
          <div className="w-full max-w-xl mx-auto mt-12 p-8 bg-white/90 rounded-xl shadow-lg flex flex-col items-center space-y-6 border border-blue-100">
            <h2 className="text-2xl font-bold text-green-700 mb-2">Join or Create a Team</h2>
            <div className="flex flex-col items-center space-y-2 w-full">
              <div className="flex items-center space-x-2 w-full">
                <Input
                  placeholder="Enter team code to join"
                  value={inputCode}
                  onChange={e => setInputCode(e.target.value.toUpperCase())}
                  className="bg-blue-50 border-blue-100 focus:border-green-300 focus:ring-green-100 w-full"
                  onKeyDown={e => { if (e.key === 'Enter') handleJoin(e); }}
                />
                <Button type="button" size="sm" className="bg-gradient-to-r from-green-400 to-blue-300 text-white" onClick={handleJoin}>Join</Button>
              </div>
              <div className="text-sm text-blue-400">Or</div>
              <Button type="button" size="sm" className="bg-gradient-to-r from-green-400 to-blue-300 text-white" onClick={handleCreate}>Create New Team</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Prompt Tests Table */}
            <Card className="bg-gray-800 border-gray-700 text-gray-200">
              <CardHeader>
                <CardTitle>Team Prompt Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-2">
                  <Button size="sm" className="bg-blue-500 text-white" onClick={() => router.push('/team/prompt-tests')}>
                    View All
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Prompt</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promptTests.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center text-blue-400">No prompt tests yet.</TableCell></TableRow>
                    ) : promptTests.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="max-w-xs truncate">{p.prompt_text}</TableCell>
                        <TableCell>{teammates.find(t => t.id === p.user_id)?.full_name || 'Unknown'}</TableCell>
                        <TableCell>{p.created_at ? new Date(p.created_at).toLocaleString() : ''}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            {/* Experiments Table */}
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader>
                <CardTitle>Team Experiments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-2">
                  <Button size="sm" className="bg-green-500 text-white" onClick={() => router.push('/team/experiments')}>
                    View All
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {experiments.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center text-blue-400">No experiments yet.</TableCell></TableRow>
                    ) : experiments.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="max-w-xs truncate">{e.name}</TableCell>
                        <TableCell>{teammates.find(t => t.id === e.user_id)?.full_name || 'Unknown'}</TableCell>
                        <TableCell>{e.created_at ? new Date(e.created_at).toLocaleString() : ''}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            {/* Teammates List */}
            <Card className="bg-gray-800 border-gray-700 md:col-span-2">
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {teammates.length === 0 ? (
                    <li className="text-blue-400">No teammates found.</li>
                  ) : teammates.map((t) => (
                    <li key={t.id} className="flex items-center space-x-2 text-blue-700">
                      <span className="font-semibold">{t.full_name || 'Unnamed'}</span>
                      <span className="text-xs text-blue-300">{t.email}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDashboard; 