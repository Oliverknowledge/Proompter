import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, Zap, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ThreeBackground from "./ThreeBackground";
import { Navbar } from "@/components/ui/navigation-menu";

interface AuthFormProps {
  onAuthComplete: () => void;
}

const AuthForm = ({ onAuthComplete }: AuthFormProps) => {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (mode: "signin" | "signup") => {
    setIsLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
      }
      onAuthComplete();
    } catch (error) {
      setError( "An error occurred during authentication");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (error) {
      setError( "An error occurred with Google authentication");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-blue-950 overflow-hidden">
   
      <div className="w-full max-w-3xl mx-auto p-8 bg-gray-900/95 rounded-2xl shadow-2xl flex flex-col items-center space-y-6 border-2 border-blue-900/60 backdrop-blur-md relative"
        style={{ boxShadow: '0 0 24px 0 #2563eb44, 0 0 48px 0 #0ea5e944' }}>
        {/* Logo */}
        <motion.div 
          className="text-center mb-8 "
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div 
            className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-blue-400/40"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Zap className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-blue-400">
            Proompter
          </h1>
          <p className="text-blue-300 mt-2">AI Prompt Evaluation Platform</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="bg-gray-900/95 border-2 border-blue-900/60 shadow-2xl w-[30rem] mb-14 rounded-2xl backdrop-blur-md"
            style={{ boxShadow: '0 0 24px 0 #2563eb44, 0 0 48px 0 #0ea5e944' }}>
            <CardHeader className="text-center">
            
            
            </CardHeader>
            <CardContent>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-4"
                >
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <Tabs defaultValue="signin" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-2 border-blue-900/60 rounded-lg mb-4 overflow-hidden">
                  <TabsTrigger value="signin" className="text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/40 transition">Sign In</TabsTrigger>
                  <TabsTrigger value="signup" className="text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/40 transition">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4">
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-blue-300">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 bg-white border-2 border-blue-200/60 focus:border-blue-400 focus:ring-blue-200 text-blue-900 shadow-sm shadow-blue-200/20"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-blue-300">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 bg-white border-2 border-blue-200/60 focus:border-blue-400 focus:ring-blue-200 text-blue-900 shadow-sm shadow-blue-200/20"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={() => handleEmailAuth("signin")}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold border-2 border-blue-400/60 shadow-lg shadow-blue-500/30 hover:shadow-cyan-400/40 transition"
                      >
                        {isLoading ? "Signing in..." : "Sign In"}
                      </Button>
                    </motion.div>
                  </motion.div>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-blue-300">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 bg-white border-2 border-blue-200/60 focus:border-blue-400 focus:ring-blue-200 text-blue-900 shadow-sm shadow-blue-200/20"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-blue-300">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 bg-white border-2 border-blue-200/60 focus:border-blue-400 focus:ring-blue-200 text-blue-900 shadow-sm shadow-blue-200/20"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={() => handleEmailAuth("signup")}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold border-2 border-blue-400/60 shadow-lg shadow-blue-500/30 hover:shadow-cyan-400/40 transition"
                      >
                        {isLoading ? "Creating account..." : "Create Account"}
                      </Button>
                    </motion.div>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthForm;
