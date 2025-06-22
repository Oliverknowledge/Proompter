"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { supabase } from "@/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/ui/navigation-menu";

const CreateTeam = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [teamCode, setTeamCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!user) throw new Error("Not authenticated");
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { error } = await supabase.from('profiles').update({ team_code: newCode }).eq('id', user.id);
      if (error) throw error;
      setTeamCode(newCode);
      setSubmitted(true);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError((err as { message?: string }).message || 'Failed to create team');
      } else {
        setError('Failed to create team');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gray-900 overflow-hidden">
      <Navbar />
      <div className="container mx-auto px-6 py-12 flex flex-col items-center justify-center">
        <Card className="bg-white/90 border-blue-100 max-w-lg w-full">
          <CardHeader>
            <CardTitle>Create a New Team</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {submitted && teamCode ? (
              <div className="text-center text-green-600 font-bold text-lg mb-4">
                Team created!<br />
                <span className="text-2xl">Team Code: {teamCode}</span>
                <div className="text-sm text-gray-500 mt-2">Share this code with your teammates so they can join your team.</div>
                <Button className="mt-6 w-full bg-gradient-to-r from-green-400 to-blue-400 text-white" onClick={() => router.push('/team')}>
                  Go to Team Dashboard
                </Button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                  <Input
                    placeholder="Enter your team name"
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <Input
                    placeholder="e.g. Technology, Healthcare, Finance"
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team Size (optional)</label>
                  <Input
                    placeholder="e.g. 5, 10, 50+"
                    value={size}
                    onChange={e => setSize(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-green-400 to-blue-400 text-white" disabled={loading}>
                  {loading ? 'Creating...' : 'Submit'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateTeam; 