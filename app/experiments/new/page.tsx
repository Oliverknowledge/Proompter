"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, X, Send, Clock, CheckCircle, AlertCircle, Sparkles, Target, Zap, ArrowLeft } from "lucide-react";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/supabase/client";

interface PromptVariant {
  id: string;
  content: string;
  status: "pending" | "running" | "completed" | "error";
  score?: number;
  tokens?: number;
  responseTime?: number;
}

// Add type for generatedPrompts items
type GeneratedPrompt = string | { output?: string; prompt?: string };

function isPromptObj(item: unknown): item is { output?: string; prompt?: string } {
  return typeof item === 'object' && item !== null && ('output' in item || 'prompt' in item);
}

const PromptSubmission = () => {
  const [experimentName, setExperimentName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [prompts, setPrompts] = useState<PromptVariant[]>([
    { id: "1", content: "", status: "pending" }
  ]);
  const mountRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [generatedPrompts, setGeneratedPrompts] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeResult, setOptimizeResult] = useState<unknown>(null);

  // Add loading states for each button
  const [loadingContinue, setLoadingContinue] = useState(false);
  const [loadingAddVariant, setLoadingAddVariant] = useState(false);
  const [loadingBack, setLoadingBack] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingOptimize, setLoadingOptimize] = useState(false);

  const { user } = useAuth();
  const [teamCode, setTeamCode] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);
  const router = useRouter()
  useEffect(() => {
    if (!mountRef.current) return;

    // Enhanced Three.js scene with darker aesthetics
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Floating particles system with darker colors
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 150;
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 25;
    }
   
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      color: 0x4ade80,
      transparent: true,
      opacity: 0.7
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Dynamic geometric shapes with darker neon colors
    const shapes: THREE.Mesh[] = [];
    const shapeGeometries = [
      new THREE.OctahedronGeometry(0.4),
      new THREE.TetrahedronGeometry(0.5),
      new THREE.IcosahedronGeometry(0.3)
    ];
    
    for (let i = 0; i < 10; i++) {
      const geometry = shapeGeometries[i % shapeGeometries.length];
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL((i * 0.1 + 0.3) % 1, 0.8, 0.6),
        transparent: true,
        opacity: 0.6,
        shininess: 100,
        emissive: new THREE.Color().setHSL((i * 0.1 + 0.3) % 1, 0.9, 0.1)
      });
      const shape = new THREE.Mesh(geometry, material);
      
      const angle = (i / 10) * Math.PI * 2;
      const radius = 7 + Math.sin(i * 0.3) * 2;
      shape.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.5,
        Math.sin(i * 0.4) * 4 - 3
      );
      scene.add(shape);
      shapes.push(shape);
    }

    // Enhanced lighting with darker ambience
    const ambientLight = new THREE.AmbientLight(0x222222, 0.3);
    scene.add(ambientLight);
    
    const lights: THREE.PointLight[] = [];
    const lightColors = [0x4ade80, 0x06b6d4, 0x8b5cf6];
    
    for (let i = 0; i < 3; i++) {
      const light = new THREE.PointLight(lightColors[i], 2, 15);
      light.position.set(
        Math.sin(i * 2.1) * 6,
        Math.cos(i * 2.1) * 6,
        2
      );
      scene.add(light);
      lights.push(light);
    }

    camera.position.z = 10;

    let mouseX = 0;
    let mouseY = 0;
    let time = 0;

    const onPointerMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onPointerMove);

    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.008;
      
      particlesMesh.rotation.y = time * 0.05;
      particlesMesh.rotation.x = Math.sin(time * 0.3) * 0.05;
      
      shapes.forEach((shape, i) => {
        shape.rotation.x = time * (0.5 + i * 0.05);
        shape.rotation.y = time * (0.3 + i * 0.03);
        shape.position.y += Math.sin(time * 1.5 + i) * 0.003;
        shape.position.x += Math.cos(time * 1.2 + i) * 0.002;
      });
      
      lights.forEach((light, i) => {
        light.position.x = Math.sin(time * 0.8 + i * 2.1) * 6;
        light.position.y = Math.cos(time * 0.8 + i * 2.1) * 6;
        light.intensity = 1 + Math.sin(time * 2 + i) * 0.3;
      });
      
      camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.03;
      camera.position.y += (mouseY * 0.3 - camera.position.y) * 0.03;
      camera.lookAt(scene.position);
      
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onPointerMove);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    // Fetch team_code for the user
    const fetchTeamCode = async () => {
      if (user && !teamCode) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('team_code')
          .eq('id', user.id)
          .single();
        if (profile?.team_code) {
          setTeamCode(profile.team_code);
        }
      }
    };
    fetchTeamCode();
  }, [user]);

  const addPrompt = () => {
    const newPrompt: PromptVariant = {
      id: Date.now().toString(),
      content: "",
      status: "pending"
    };
    setPrompts([...prompts, newPrompt]);
  };

  const removePrompt = (id: string) => {
    setPrompts(prompts.filter(p => p.id !== id));
  };

  const updatePrompt = (id: string, content: string) => {
    setPrompts(prompts.map(p => p.id === id ? { ...p, content } : p));
  };

  const getStatusIcon = (status: PromptVariant["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case "running":
        return <Clock className="w-4 h-4 text-cyan-400 animate-spin" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: PromptVariant["status"]) => {
    switch (status) {
      case "completed":
        return "bg-emerald-900/50 text-emerald-300 border-emerald-600/50";
      case "running":
        return "bg-cyan-900/50 text-cyan-300 border-cyan-600/50";
      case "error":
        return "bg-red-900/50 text-red-300 border-red-600/50";
      default:
        return "bg-gray-800/50 text-gray-400 border-gray-600/50";
    }
  };

  const progressPercentage = (stage / 3) * 100;

  const handleGenerate = async () => {
    if (!user || !teamCode) {
      alert('User or team code not found. Please make sure you are logged in and part of a team.');
      return;
    }
    
    // Collect the relevant fields for the run API
    const runPayload = {
      task: taskDescription,
      prompts: prompts.map(p => p.content),
      user_id: user.id,
      team_code: teamCode,
    };
    console.log("team code and user id", teamCode, user.id);
    try {
      setIsOptimizing(true);
      const runRes = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(runPayload),
      });
      const runData = await runRes.json();
      if (!runData.prompts || !Array.isArray(runData.prompts)) {
        throw new Error(runData.error || "Run API did not return prompts");
      }
      setGeneratedPrompts(runData.prompts);
      setStage(3);
    } catch (err) {
      console.error("Run request failed:", err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleOptimize = async () => {
    if (!generatedPrompts.length) return;
    if (!user || !teamCode) {
      alert('User or team code not found. Please make sure you are logged in and part of a team.');
      return;
    }
    console.log("team code and user id for the otimize route", teamCode, user.id)
    const optimizePayload = {
      experimentName,
      taskDescription,
      expectedOutput,
      prompts: generatedPrompts,
      user_id: user.id,
      team_code: teamCode,
    };
    try {
      setIsOptimizing(true);
      console.log("team code and user id for the otimize route", teamCode, user.id)
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(optimizePayload),
      });
      const data = await res.json();
      setOptimizeResult(data);
      // Redirect to results page with result in query or state
      router.push(`/experiments/new/results?result=${encodeURIComponent(JSON.stringify(data))}`);
    } catch (err) {
      console.error("Optimize request failed:", err);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Update button handlers to set loading states
  const handleContinue = () => {
    setLoadingContinue(true);
    setTimeout(() => {
      setStage(2);
      setLoadingContinue(false);
    }, 400); // Simulate loading
  };
  const handleAddVariant = () => {
    setLoadingAddVariant(true);
    setTimeout(() => {
      addPrompt();
      setLoadingAddVariant(false);
    }, 300); // Simulate loading
  };
  const handleBack = (toStage: number) => {
    setLoadingBack(true);
    setTimeout(() => {
      setStage(toStage);
      setLoadingBack(false);
    }, 400);
  };
  const handleGenerateWithLoading = async () => {
    setLoadingGenerate(true);
    await handleGenerate();
    setLoadingGenerate(false);
  };
  const handleOptimizeWithLoading = async () => {
    setLoadingOptimize(true);
    await handleOptimize();
    setLoadingOptimize(false);
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-gray-900 via-slate-900 to-black overflow-hidden">
      <div ref={mountRef} className="fixed inset-0 pointer-events-none z-0" />
      
      {/* Floating orbs with darker colors */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full opacity-20 animate-pulse ${
              i % 3 === 0 ? 'bg-gradient-to-br from-emerald-600 to-emerald-800' : 
              i % 3 === 1 ? 'bg-gradient-to-br from-cyan-600 to-cyan-800' :
              'bg-gradient-to-br from-purple-600 to-purple-800'
            }`}
            style={{
              width: `${80 + i * 40}px`,
              height: `${80 + i * 40}px`,
              left: `${5 + i * 12}%`,
              top: `${15 + i * 8}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${4 + i * 0.5}s`
            }}
          />
        ))}
      </div>
        
      <div className="relative z-20 w-full max-w-4xl mx-auto px-6 py-12">
        <div className={`transition-all duration-700 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
       
          {stage === 1 && (
            <>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-3xl blur-2xl" />
                <Card className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 shadow-2xl rounded-3xl overflow-hidden">
                  <div className="relative bg-gradient-to-r from-gray-800/95 to-slate-800/95 p-8 border-b border-gray-700/50">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-cyan-600/20" />
                    <CardHeader className="relative z-10 p-0">
                      <Button 
                        className="absolute top-0 right-0 bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 border-gray-600/50"
                        variant="outline"
                        onClick={() => router.push("/")}
                      >
                        Back to dashboard
                      </Button>
                      <div className="flex items-center space-x-3 mb-2">
                        <Target className="w-8 h-8 text-emerald-400" />
                        <CardTitle className="text-3xl font-bold text-white">Define Your Mission</CardTitle>
                      </div>
                      <CardDescription className="text-gray-300 text-lg">
                        Set the foundation for your prompt optimization experiment
                      </CardDescription>
                    </CardHeader>
                  </div>

                  <CardContent className="p-8 space-y-8">
                    <div className="group">
                      <Label htmlFor="experiment-name" className="text-gray-200 text-lg font-semibold mb-3 block">
                        Experiment Name
                      </Label>
                      <div className="relative">
                        <Input
                          id="experiment-name"
                          placeholder="e.g., Customer Service Email Generator"
                          value={experimentName}
                          onChange={(e) => setExperimentName(e.target.value)}
                          className="bg-gray-800/60 border-gray-600/50 text-gray-100 placeholder-gray-400 text-lg p-4 rounded-xl backdrop-blur-sm focus:bg-gray-800/80 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <Label htmlFor="task-description" className="text-gray-200 text-lg font-semibold mb-3 block">
                        Task Description
                      </Label>
                      <div className="relative">
                        <Input
                          id="task-description"
                          placeholder="e.g., Generate empathetic and professional customer service responses"
                          value={taskDescription}
                          onChange={(e) => setTaskDescription(e.target.value)}
                          className="bg-gray-800/60 border-gray-600/50 text-gray-100 placeholder-gray-400 text-lg p-4 rounded-xl backdrop-blur-sm focus:bg-gray-800/80 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <Label htmlFor="expected-output" className="text-gray-200 text-lg font-semibold mb-3 block">
                        Expected Output
                      </Label>
                      <div className="relative">
                        <Textarea
                          id="expected-output"
                          placeholder="Describe the ideal response format, tone, length, and key elements you want to see in the generated content..."
                          value={expectedOutput}
                          onChange={(e) => setExpectedOutput(e.target.value)}
                          rows={4}
                          className="bg-gray-800/60 border-gray-600/50 text-gray-100 placeholder-gray-400 text-lg p-4 rounded-xl backdrop-blur-sm focus:bg-gray-800/80 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 resize-none"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <div className="px-8 pb-8 flex justify-between">
                    <Button 
                      onClick={handleContinue}
                      className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white px-8 py-3 font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                      disabled={loadingContinue}
                    >
                      {loadingContinue ? (
                        <>
                          <span className="animate-spin mr-2"><Sparkles className="w-5 h-5" /></span>Loading...
                        </>
                      ) : (
                        <>
                          Continue to Prompts
                          <Sparkles className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </div>
              
              <div className="mt-8 px-2">
                <div className="transition-all duration-1000 ease-out transform translate-y-0 opacity-100">
                  <div className="mb-2">
                    <div className="relative">
                      <div className="absolute -bottom-4 left-0 right-0 h-2 bg-gray-700/50 rounded-full backdrop-blur-sm -translate-y-1/2" />
                      <div 
                        className="absolute  -bottom-4 left-0 h-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full -translate-y-1/2 transition-all duration-1000 ease-out shadow-lg shadow-emerald-500/30"
                        style={{ width: `${progressPercentage}%` }}
                      />
                      <div className="relative flex justify-between items-center">
                        {[1, 2, 3].map((stepNumber) => (
                          <div key={stepNumber} className="flex flex-col items-center">
                            <div
                              className={`w-12 h-12 mb-2 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 transform ${
                                stage >= stepNumber
                                  ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-white scale-110 shadow-2xl shadow-emerald-500/50'
                                  : 'bg-gray-700/60 text-gray-400 backdrop-blur-sm border-2 border-gray-600/50'
                              } ${stage === stepNumber ? 'animate-pulse' : ''}`}
                            >
                              {stepNumber === 1 ? <Target className="w-6 h-6" /> : 
                               stepNumber === 2 ? <Sparkles className="w-6 h-6" /> : 
                               <Zap className="w-6 h-6" />}
                            </div>
                            <div className={`mt-2 text-center transition-all duration-300 ${
                              stage >= stepNumber ? 'text-gray-200' : 'text-gray-500'
                            }`}>
                              <div className="font-semibold text-xs">
                                {stepNumber === 1 ? 'Define' : stepNumber === 2 ? 'Create' : 'Optimize'}
                              </div>
                              <div className="text-[10px] mt-1 opacity-80">
                                {stepNumber === 1 ? 'Task & Output' : stepNumber === 2 ? 'Prompts' : 'Results'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {stage === 2 && (
            <>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-3xl blur-2xl" />
              
              <Card className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 shadow-2xl rounded-3xl overflow-hidden">
                <div className="relative bg-gradient-to-r from-gray-800/95 to-slate-800/95 p-8 border-b border-gray-700/50">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20" />
                  <CardHeader className="relative z-10 p-0">
                  <Button 
                        className="absolute top-0 right-0 bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 border-gray-600/50"
                        variant="outline"
                        onClick={() => router.push("/")}
                      >
                      Back to dashboard
                    </Button>
                    <div className="flex items-center space-x-3 mb-2">
                      <Sparkles className="w-8 h-8 text-cyan-400" />
                      <CardTitle className="text-3xl font-bold text-white">Create Prompt Variants</CardTitle>
                    </div>
                    <CardDescription className="text-gray-300 text-lg">
                      Design multiple prompt variations to test and compare
                    </CardDescription>
                  </CardHeader>
                </div>

                <CardContent className="p-8 space-y-6">
                  {prompts.map((prompt, index) => (
                    <div key={prompt.id} className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-800/20 to-gray-700/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg font-semibold text-gray-200">Variant {index + 1}</span>
                            <Badge className={`${getStatusColor(prompt.status)} border`}>
                              {getStatusIcon(prompt.status)}
                              <span className="ml-2 capitalize">{prompt.status}</span>
                            </Badge>
                          </div>
                          {prompts.length > 1 && (
                            <Button
                              onClick={() => removePrompt(prompt.id)}
                              size="sm"
                              variant="ghost"
                              className="text-gray-400 hover:text-gray-200 hover:bg-red-500/20 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <Textarea
                          placeholder="Enter your prompt variation here..."
                          value={prompt.content}
                          onChange={(e) => updatePrompt(prompt.id, e.target.value)}
                          rows={4}
                          className="bg-gray-900/60 border-gray-600/50 text-gray-100 placeholder-gray-400 text-base p-4 rounded-xl backdrop-blur-sm focus:bg-gray-900/80 focus:border-cyan-500/60 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-300 resize-none w-full"
                        />
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-center">
                    <Button 
                      onClick={handleAddVariant} 
                      variant="outline" 
                      className="border-gray-600/50 text-gray-300 hover:bg-gray-800/50 hover:border-gray-500/50 px-6 py-3 rounded-xl backdrop-blur-sm transition-all duration-300"
                      disabled={loadingAddVariant}
                    >
                      {loadingAddVariant ? (
                        <span className="animate-spin mr-2"><Plus className="w-5 h-5" /></span>
                      ) : (
                        <>
                          <Plus className="w-5 h-5 mr-2" />
                          Add New Variant
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>

                <div className="p-8 pt-0 flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => handleBack(1)} 
                    className="border-gray-600/50 text-gray-300 hover:bg-gray-800/50 hover:border-gray-500/50 px-6 py-3 rounded-xl backdrop-blur-sm"
                    disabled={loadingBack}
                  >
                    {loadingBack ? (
                      <span className="animate-spin mr-2"><ArrowLeft className="w-5 h-5" /></span> ) : 'Back'}
                  </Button>
                  <Button 
                    onClick={handleGenerateWithLoading} 
                    className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white px-8 py-3 font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    disabled={loadingGenerate}
                  >
                    {loadingGenerate ? (
                      <span className="animate-spin mr-2"><Zap className="w-5 h-5" /></span> ) : (
                        isOptimizing ? "Generating..." : <>Optimize Prompts<Zap className="w-5 h-5 ml-2" /></>
                      )}
                  </Button>
                </div>
              </Card>
            </div>
            <div className="mt-8 px-2">
                <div className="transition-all duration-1000 ease-out transform translate-y-0 opacity-100">
                  <div className="mb-2">
                    <div className="relative">
                      <div className="absolute -bottom-4 left-0 right-0 h-2 bg-gray-700/50 rounded-full backdrop-blur-sm -translate-y-1/2" />
                      <div 
                        className="absolute  -bottom-4 left-0 h-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full -translate-y-1/2 transition-all duration-1000 ease-out shadow-lg shadow-emerald-500/30"
                        style={{ width: `${progressPercentage}%` }}
                      />
                      <div className="relative flex justify-between items-center">
                        {[1, 2, 3].map((stepNumber) => (
                          <div key={stepNumber} className="flex flex-col items-center">
                            <div
                              className={`w-12 h-12 mb-2 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 transform ${
                                stage >= stepNumber
                                  ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-white scale-110 shadow-2xl shadow-emerald-500/50'
                                  : 'bg-gray-700/60 text-gray-400 backdrop-blur-sm border-2 border-gray-600/50'
                              } ${stage === stepNumber ? 'animate-pulse' : ''}`}
                            >
                              {stepNumber === 1 ? <Target className="w-6 h-6" /> : 
                               stepNumber === 2 ? <Sparkles className="w-6 h-6" /> : 
                               <Zap className="w-6 h-6" />}
                            </div>
                            <div className={`mt-2 text-center transition-all duration-300 ${
                              stage >= stepNumber ? 'text-gray-200' : 'text-gray-500'
                            }`}>
                              <div className="font-semibold text-xs">
                                {stepNumber === 1 ? 'Define' : stepNumber === 2 ? 'Create' : 'Optimize'}
                              </div>
                              <div className="text-[10px] mt-1 opacity-80">
                                {stepNumber === 1 ? 'Task & Output' : stepNumber === 2 ? 'Prompts' : 'Results'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {stage === 3 && (
            <>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-emerald-500/10 rounded-3xl blur-2xl" />
              
              <Card className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 shadow-2xl rounded-3xl overflow-hidden">
                <div className="relative bg-gradient-to-r from-gray-800/95 to-slate-800/95 p-8 border-b border-gray-700/50">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-emerald-600/20" />
                  <CardHeader className="relative z-10 p-0">
                  <Button 
                        className="absolute top-0 right-0 bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 border-gray-600/50"
                        variant="outline"
                        onClick={() => router.push("/")}
                      >
                      Back to dashboard
                    </Button>
                    <div className="flex items-center space-x-3 mb-2">
                      <Zap className="w-8 h-8 text-purple-400" />
                      <CardTitle className="text-3xl font-bold text-white">Optimize & Analyze</CardTitle>
                    </div>
                    <CardDescription className="text-gray-300 text-lg">
                      Review performance metrics and refine your prompts
                    </CardDescription>
                  </CardHeader>
                </div>

                <CardContent className="p-8 space-y-6">
                  {(generatedPrompts as GeneratedPrompt[]).map((item, index) => (
                    <div key={index} className="group relative">
                      <div className="relative bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg font-semibold text-gray-200">Variant {index + 1}</span>
                          </div>
                        </div>
                        <Textarea
                          value={isPromptObj(item) ? (item.output || item.prompt || '') : String(item)}
                          readOnly
                          rows={4}
                          className="bg-gray-900/60 border-gray-600/50 text-gray-100 placeholder-gray-400 text-base p-4 rounded-xl backdrop-blur-sm focus:bg-gray-900/80 focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 resize-none w-full mb-4"
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>

                <div className="p-8 pt-0 flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => handleBack(2)} 
                    className="border-gray-600/50 text-gray-300 hover:bg-gray-800/50 hover:border-gray-500/50 px-6 py-3 rounded-xl backdrop-blur-sm"
                    disabled={loadingBack}
                  >
                    {loadingBack ? (
                      <span className="animate-spin mr-2"><ArrowLeft className="w-5 h-5" /></span> ) : 'Back'}
                  </Button>
                  <Button 
                    onClick={handleOptimizeWithLoading}
                    className="bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 text-white px-8 py-3 font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    disabled={loadingOptimize}
                  >
                    {loadingOptimize ? (
                      <span className="animate-spin mr-2"><Send className="w-5 h-5" /></span> ) : (
                        isOptimizing ? "Evaluating..." : <><Send className="w-5 h-5 mr-2" />Run Evaluation</>
                      )}
                  </Button>
                </div>
              </Card>
            </div>
            <div className="mt-8 px-2">
                <div className="transition-all duration-1000 ease-out transform translate-y-0 opacity-100">
                  <div className="mb-2">
                    <div className="relative">
                      <div className="absolute -bottom-4 left-0 right-0 h-2 bg-gray-700/50 rounded-full backdrop-blur-sm -translate-y-1/2" />
                      <div 
                        className="absolute  -bottom-4 left-0 h-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full -translate-y-1/2 transition-all duration-1000 ease-out shadow-lg shadow-emerald-500/30"
                        style={{ width: `${progressPercentage}%` }}
                      />
                      <div className="relative flex justify-between items-center">
                        {[1, 2, 3].map((stepNumber) => (
                          <div key={stepNumber} className="flex flex-col items-center">
                            <div
                              className={`w-12 h-12 mb-2 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 transform ${
                                stage >= stepNumber
                                  ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-white scale-110 shadow-2xl shadow-emerald-500/50'
                                  : 'bg-gray-700/60 text-gray-400 backdrop-blur-sm border-2 border-gray-600/50'
                              } ${stage === stepNumber ? 'animate-pulse' : ''}`}
                            >
                              {stepNumber === 1 ? <Target className="w-6 h-6" /> : 
                               stepNumber === 2 ? <Sparkles className="w-6 h-6" /> : 
                               <Zap className="w-6 h-6" />}
                            </div>
                            <div className={`mt-2 text-center transition-all duration-300 ${
                              stage >= stepNumber ? 'text-gray-200' : 'text-gray-500'
                            }`}>
                              <div className="font-semibold text-xs">
                                {stepNumber === 1 ? 'Define' : stepNumber === 2 ? 'Create' : 'Optimize'}
                              </div>
                              <div className="text-[10px] mt-1 opacity-80">
                                {stepNumber === 1 ? 'Task & Output' : stepNumber === 2 ? 'Prompts' : 'Results'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptSubmission;