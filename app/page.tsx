"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Homepage from "@/components/Homepage";
import Onboarding from "@/components/Onboarding";
import AuthForm from "@/components/AuthForm";
import Dashboard from "@/components/Dashboard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/supabase/client";
import PromptSubmission from "@/components/PromptSubmission";
import TeamCollaboration from "@/components/TeamCollaboration";


const Index = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<"homepage" | "auth" | "onboarding" | "dashboard" | "team">(); // Start as undefined
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    if (loading) return; // Don't set currentView until loading is false
    const checkOnboardingStatus = async () => {
      if (user) {
        // Check if user has completed onboarding by checking if profile has required fields
        const { data: profile } = await supabase
          .from('profiles')
          .select('company, role, team_size, experience, use_case')
          .eq('id', user.id)
          .single();

        if (profile && profile.company && profile.role) {
          setHasCompletedOnboarding(true);
          setCurrentView("dashboard");
        } else {
          setCurrentView("onboarding");
        }
      } else {
        setCurrentView("homepage");
      }
    };
    checkOnboardingStatus();
  }, [user, loading]);

  const handleGetStarted = () => {
    setCurrentView("auth");
  };

  const handleSignIn = () => {
    setCurrentView("auth");
  };

  const handleAuthComplete = () => {
    // This will be handled by the useEffect above
  };

  const handleOnboardingComplete = async () => {
    setHasCompletedOnboarding(true);
    setCurrentView("dashboard");
  };

  if (loading || currentView === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // Show different views based on state
  if (currentView === "homepage") {
    return <Homepage onGetStarted={handleGetStarted} onSignIn={handleSignIn} />;
  }

  if (currentView === "auth") {
    return <AuthForm onAuthComplete={handleAuthComplete} />;
  }

  if (currentView === "onboarding") {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (currentView === "dashboard") {
    return <Dashboard />;
  }

  if (currentView === "team") {
    return <TeamCollaboration />;
  }

  return <Homepage onGetStarted={handleGetStarted} onSignIn={handleSignIn} />;
};

export default Index;
