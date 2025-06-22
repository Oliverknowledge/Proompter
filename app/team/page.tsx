"use client";
import TeamDashboard from "@/components/TeamDashboard";
import CreateTeam from "@/components/CreateTeam";
import { usePathname } from "next/navigation";

const Team = () => {
  const pathname = usePathname();
  if (pathname === "/team/create") {
    return <CreateTeam />;
  }
  return <TeamDashboard />;
};

export default Team; 