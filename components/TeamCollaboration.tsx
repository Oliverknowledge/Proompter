import { useEffect, useState } from "react";
import { Navbar } from "@/components/ui/navigation-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/supabase/client";
import ThreeBackground from "./ThreeBackground";

const TeamCollaboration = () => {
  const [teamCode, setTeamCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    const fetchTeamCode = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('team_code')
          .eq('id', user.id)
          .single();
        if (profile && profile.team_code) setTeamCode(profile.team_code);
      }
    };
    fetchTeamCode();
  }, []);

  useEffect(() => {
    const fetchTeamMembers = async (code: string) => {
      if (!code) return;
      const { data: members } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('team_code', code);
      setTeamMembers(members || []);
    };
    if (teamCode) fetchTeamMembers(teamCode);
  }, [teamCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(teamCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleJoin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && inputCode) {
      await supabase.from('profiles').update({ team_code: inputCode }).eq('id', user.id);
      setTeamCode(inputCode);
      setInputCode("");
    }
  };

  const handleCreate = async () => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ team_code: newCode }).eq('id', user.id);
      setTeamCode(newCode);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-green-200 via-blue-100 to-blue-200 overflow-hidden">
      
      <Navbar />
      <div className="w-full max-w-xl mx-auto mt-24 p-8 bg-white/90 rounded-xl shadow-lg flex flex-col items-center space-y-6 border border-blue-100">
        <h2 className="text-2xl font-bold text-green-700 mb-2">Team Collaboration</h2>
        {teamCode ? (
          <div className="flex flex-col items-center space-y-2 w-full">
            <div className="flex items-center space-x-2">
              <span className="font-mono px-3 py-1 rounded bg-blue-50 border border-blue-200 text-blue-600">{teamCode}</span>
              <Button size="sm" variant="outline" className="border-green-300 text-green-700" onClick={handleCopy}>{copied ? "Copied!" : "Copy Code"}</Button>
            </div>
            <div className="text-sm text-blue-400">Share this code with your team to collaborate and share prompts.</div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2 w-full">
            <div className="flex items-center space-x-2 w-full">
              <Input
                placeholder="Enter team code to join"
                value={inputCode}
                onChange={e => setInputCode(e.target.value.toUpperCase())}
                className="bg-blue-50 border-blue-100 focus:border-green-300 focus:ring-green-100 w-full"
              />
              <Button size="sm" className="bg-gradient-to-r from-green-400 to-blue-300 text-white" onClick={handleJoin}>Join</Button>
            </div>
            <div className="text-sm text-blue-400">Or</div>
            <Button size="sm" className="bg-gradient-to-r from-green-400 to-blue-300 text-white" onClick={handleCreate}>Create New Team</Button>
          </div>
        )}
        {teamCode && teamMembers.length > 0 && (
          <div className="w-full mt-4">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Team Members</h3>
            <ul className="space-y-1">
              {teamMembers.map((member, idx) => (
                <li key={idx} className="flex items-center space-x-2 text-blue-700">
                  <span className="font-semibold">{member.full_name || 'Unnamed'}</span>
                  <span className="text-xs text-blue-300">{member.email}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamCollaboration; 