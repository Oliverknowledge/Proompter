"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Navbar } from "@/components/ui/navigation-menu";

interface Experiment {
  id: string;
  name: string;
  user_id: string;
  created_at: string | null;
}

const TeamExperiments = () => {
  const { user } = useAuth();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamCode, setTeamCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamCodeAndExperiments = async () => {
      setLoading(true);
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('team_code')
        .eq('id', user.id)
        .single();
      const code = profile?.team_code;
      if (code){
      setTeamCode(code);
      }
      if (!code) {
        setExperiments([]);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('experiments')
        .select('*')
        .eq('team_code', code)
        .order('created_at', { ascending: false });
      setExperiments(data || []);
      setLoading(false);
    };
    fetchTeamCodeAndExperiments();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-gray-100 mb-6">Team Experiments</h2>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-10 h-10 border-4 border-blue-400 border-t-green-400 border-b-transparent border-l-transparent rounded-full animate-spin" />
            <span className="ml-4 text-blue-200">Loading...</span>
          </div>
        ) : experiments.length === 0 ? (
          <div className="text-gray-400 text-center mt-20">No team experiments found.</div>
        ) : (
          <div className="space-y-6 ">
            {experiments.map(exp => (
              <Card key={exp.id} className="bg-gray-800 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-100">{exp.name}</CardTitle>
                  <CardDescription className="text-gray-400 text-sm">{exp.created_at ? new Date(exp.created_at).toLocaleString() : ''}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-gray-300">Experiment ID: {exp.id}</span>
                  <br />
                  <span className="text-gray-400 text-xs">Created by: {exp.user_id}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamExperiments; 