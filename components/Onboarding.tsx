import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Zap, Users, Target, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/supabase/client";
import ThreeBackground from "./ThreeBackground";

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState({
    name: "",
    company: "",
    role: "",
    teamSize: "",
    useCase: "",
    experience: ""
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save user data to Supabase
      if (user) {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({
              full_name: userData.name,
              company: userData.company,
              role: userData.role,
              team_size: userData.teamSize,
              use_case: userData.useCase,
              experience: userData.experience,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

          if (error) {
            console.error('Error updating profile:', error);
          } else {
            onComplete();
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateUserData = (field: string, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <motion.div 
                className="w-16 h-16 bg-gradient-to-r from-blue-400 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Proompter!</h2>
              <p className="text-gray-600">Let's get you set up in just a few minutes</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={userData.name}
                  onChange={(e) => updateUserData("name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="Your company name"
                  value={userData.company}
                  onChange={(e) => updateUserData("company", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="role">Your Role</Label>
                <Input
                  id="role"
                  placeholder="e.g., Product Manager, Engineer, Researcher"
                  value={userData.role}
                  onChange={(e) => updateUserData("role", e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <motion.div 
                className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4"
                whileHover={{ scale: 1.05, rotate: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Users className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about your team</h2>
              <p className="text-gray-600">This helps us customize your experience</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Team Size</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {["Just me", "2-5 people", "6-20 people", "20+ people"].map((size) => (
                    <motion.div
                      key={size}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant={userData.teamSize === size ? "default" : "outline"}
                        onClick={() => updateUserData("teamSize", size)}
                        className="h-12 w-full"
                      >
                        {size}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Experience with AI Prompts</Label>
                <div className="grid grid-cols-1 gap-3 mt-2">
                  {[
                    "New to prompt engineering",
                    "Some experience with AI tools",
                    "Experienced prompt engineer",
                    "AI/ML professional"
                  ].map((exp) => (
                    <motion.div
                      key={exp}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant={userData.experience === exp ? "default" : "outline"}
                        onClick={() => updateUserData("experience", exp)}
                        className="h-12 justify-start w-full"
                      >
                        {exp}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <motion.div 
                className="w-16 h-16 bg-gradient-to-r from-green-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Target className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your main use case?</h2>
              <p className="text-gray-600">Help us understand how you'll use Proompter</p>
            </div>

            <div className="space-y-3">
              {[
                "Customer support automation",
                "Content generation",
                "Code generation & documentation",
                "Data analysis & insights",
                "Educational content",
                "Marketing & copywriting",
                "Research & summarization",
                "Other"
              ].map((useCase) => (
                <motion.div
                  key={useCase}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant={userData.useCase === useCase ? "default" : "outline"}
                    onClick={() => updateUserData("useCase", useCase)}
                    className="w-full h-12 justify-start"
                  >
                    {useCase}
                  </Button>
                </motion.div>
              ))}
            </div>

            {userData.useCase === "Other" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <Label htmlFor="custom-use-case">Tell us more</Label>
                <Textarea
                  id="custom-use-case"
                  placeholder="Describe your specific use case..."
                  className="mt-2"
                />
              </motion.div>
            )}
          </motion.div>
        );

      case 4:
        return (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <motion.div 
                className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4"
                whileHover={{ scale: 1.05 }}
                animate={{ rotate: [0, 360] }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { type: "spring", stiffness: 300 }
                }}
              >
                <CheckCircle className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h2>
              <p className="text-gray-600">Ready to start optimizing your AI prompts</p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">What's next?</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-400 font-semibold text-sm">1</span>
                  </div>
                  <span className="text-gray-700">Create your first experiment</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-400 font-semibold text-sm">2</span>
                  </div>
                  <span className="text-gray-700">Submit prompt variations to test</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-400 font-semibold text-sm">3</span>
                  </div>
                  <span className="text-gray-700">Compare results and optimize</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Zap className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Pro Tip</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Start with simple prompt variations and gradually increase complexity as you learn what works best.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      <ThreeBackground />
      
      <motion.div 
        className="w-full max-w-lg relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="text-blue-400 border-blue-200">
                Step {currentStep} of {totalSteps}
              </Badge>
              <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            {renderStep()}
            
            <div className="flex justify-between pt-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-blue-400 to-green-600 hover:from-blue-600 hover:to-green-700"
                >
                  {currentStep === totalSteps ? "Get Started" : "Next"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Onboarding;
