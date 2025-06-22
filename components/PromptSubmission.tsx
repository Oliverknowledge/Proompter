"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, X, Send, Clock, CheckCircle, AlertCircle, Sparkles, Target, Zap } from "lucide-react";
import * as THREE from "three";
import { useRouter } from 'next/navigation';

interface PromptVariant {
  id: string;
  content: string;
  status: "pending" | "running" | "completed" | "error";
  score?: number;
  tokens?: number;
  responseTime?: number;
}

const PromptSubmission = () => {
  const router = useRouter();
  const [experimentName, setExperimentName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [prompts, setPrompts] = useState<PromptVariant[]>([
    { id: "1", content: "", status: "pending" }
  ]);
  const mountRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(1);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    // Enhanced Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    // Floating particles system
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 100;
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 20;
    }
   
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.04,
      color: 0x00ffff,
      transparent: true,
      opacity: 0.9
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Dynamic geometric shapes - positioned around the edges to avoid card overlap
    const shapes: THREE.Mesh[] = [];
    const shapeGeometries = [
      new THREE.OctahedronGeometry(0.5),
      new THREE.TetrahedronGeometry(0.6),
      new THREE.IcosahedronGeometry(0.4)
    ];
    
    for (let i = 0; i < 8; i++) {
      const geometry = shapeGeometries[i % shapeGeometries.length];
      const material = new THREE.MeshPhongMaterial({
        color: new THREE.Color().setHSL((i * 0.125 + 0.4) % 1, 1.0, 0.8),
        transparent: true,
        opacity: 0.8,
        shininess: 100,
        emissive: new THREE.Color().setHSL((i * 0.125 + 0.4) % 1, 0.8, 0.3)
      });
      const shape = new THREE.Mesh(geometry, material);
      
      // Position shapes around the edges of the screen, avoiding center
      const angle = (i / 8) * Math.PI * 2;
      const radius = 6 + Math.sin(i * 0.5) * 2;
      shape.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.6,
        Math.sin(i * 0.5) * 3 - 2
      );
      scene.add(shape);
      shapes.push(shape);
    }

    // Dynamic lighting system
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const lights: THREE.PointLight[] = [];
    const lightColors = [0x00ffff, 0xff00ff, 0xffff00];
    
    for (let i = 0; i < 3; i++) {
      const light = new THREE.PointLight(lightColors[i], 3, 20);
      light.position.set(
        Math.sin(i * 2.1) * 5,
        Math.cos(i * 2.1) * 5,
        3
      );
      scene.add(light);
      lights.push(light);
    }

    camera.position.z = 8;

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
      time += 0.01;
      
      // Animate particles
      particlesMesh.rotation.y = time * 0.1;
      particlesMesh.rotation.x = Math.sin(time * 0.2) * 0.1;
      
      // Animate shapes
      shapes.forEach((shape, i) => {
        shape.rotation.x = time * (1 + i * 0.1);
        shape.rotation.y = time * (0.8 + i * 0.05);
        shape.position.y += Math.sin(time * 2 + i) * 0.005;
        shape.position.x += Math.cos(time * 1.5 + i) * 0.003;
      });
      
      // Animate lights
      lights.forEach((light, i) => {
        light.position.x = Math.sin(time + i * 2.1) * 5;
        light.position.y = Math.cos(time + i * 2.1) * 5;
        light.intensity = 1.5 + Math.sin(time * 3 + i) * 0.5;
      });
      
      // Mouse interaction
      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.05;
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
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "running":
        return <Clock className="w-4 h-4 text-cyan-500 animate-spin" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: PromptVariant["status"]) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "running":
        return "bg-cyan-100 text-cyan-700 border-cyan-200";
      case "error":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const progressPercentage = (stage / 3) * 100;

  return (
    <div className="relative min-h-screen w-full bg-gray-900 overflow-hidden">
      <div ref={mountRef} className="fixed inset-0 pointer-events-none z-0" />
      
      {/* Floating orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-gradient-to-br opacity-60 animate-pulse ${
              i % 2 === 0 ? 'from-cyan-300 to-blue-300' : 'from-emerald-300 to-cyan-300'
            }`}
            style={{
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              left: `${10 + i * 15}%`,
              top: `${10 + i * 10}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i}s`
            }}
          />
        ))}
      </div>
        
      <div className="relative z-20 w-full max-w-4xl mx-auto px-6 py-12">
        {/* Enhanced Progress Indicator - only above card for stage 2/3 */}
       
        {/* Enhanced Stage Content */}
        <div className={`transition-all duration-700 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
       
          {stage === 1 && (
            <>
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-3xl blur-xl" />
                <Card className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-700 shadow-2xl rounded-3xl overflow-hidden">
                  {/* Header with animated gradient */}
                  
                  <div className="relative bg-gradient-to-r from-gray-800/95 to-gray-900/95 p-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 opacity-70 animate-pulse" />
                    <CardHeader className="relative z-10 p-0">
                    <Button className = "absolute top-0 right-0" onClick={() => router.push("/") }>
            Back to dashboard
          </Button>
                      <div className="flex items-center space-x-3 mb-2">
                        <Target className="w-8 h-8 text-white" />
                        <CardTitle className="text-3xl font-bold text-white">Define Your Mission</CardTitle>
                      </div>
                      <CardDescription className="text-white/90 text-lg">
                        Set the foundation for your prompt optimization experiment
                      </CardDescription>
                    </CardHeader>
                  </div>

                  <CardContent className="p-8 space-y-8">
                    {/* Experiment Name */}
                    <div className="group">
                      <Label htmlFor="experiment-name" className="text-gray-100 text-lg font-semibold mb-3 block">
                        Experiment Name
                      </Label>
                      <div className="relative">
                        <Input
                          id="experiment-name"
                          placeholder="e.g., Customer Service Email Generator"
                          value={experimentName}
                          onChange={(e) => setExperimentName(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400 text-lg p-4 rounded-xl backdrop-blur-sm focus:bg-gray-900 focus:border-cyan-500/80 focus:ring-4 focus:ring-cyan-400/30 transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Task Description */}
                    <div className="group">
                      <Label htmlFor="task-description" className="text-gray-100 text-lg font-semibold mb-3 block">
                        Task Description
                      </Label>
                      <div className="relative">
                        <Input
                          id="task-description"
                          placeholder="e.g., Generate empathetic and professional customer service responses"
                          value={taskDescription}
                          onChange={(e) => setTaskDescription(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400 text-lg p-4 rounded-xl backdrop-blur-sm focus:bg-gray-900 focus:border-cyan-500/80 focus:ring-4 focus:ring-cyan-400/30 transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Expected Output */}
                    <div className="group">
                      <Label htmlFor="expected-output" className="text-gray-100 text-lg font-semibold mb-3 block">
                        Expected Output
                      </Label>
                      <div className="relative">
                        <Textarea
                          id="expected-output"
                          placeholder="Describe the ideal response format, tone, length, and key elements you want to see in the generated content..."
                          value={expectedOutput}
                          onChange={(e) => setExpectedOutput(e.target.value)}
                          rows={4}
                          className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400 text-lg p-4 rounded-xl backdrop-blur-sm focus:bg-gray-900 focus:border-cyan-500/80 focus:ring-4 focus:ring-cyan-400/30 transition-all duration-300 resize-none"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <div className="px-8 pb-8 flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => setStage(2)} 
                      className="bg-gradient-to-r from-cyan-700 to-emerald-700 hover:from-cyan-800 hover:to-emerald-800 text-white px-8 py-3 font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      Continue to Prompts
                      <Sparkles className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </Card>
              </div>
              {/* Progress/Stepper UI under the card for stage 1, but outside the card */}
              <div className="mt-12 mb-12 px-2">
                <div className="transition-all duration-1000 ease-out transform translate-y-0 opacity-100">
                  <div className="mb-2">
                    <div className="relative">
                      {/* Progress track */}
                      <div className="absolute top-1/2 left-0 right-0 h-2 bg-white/30 rounded-full backdrop-blur-sm -translate-y-1/2" />
                      <div 
                        className="absolute top-1/2 left-0 h-2 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full -translate-y-1/2 transition-all duration-1000 ease-out shadow-lg shadow-cyan-400/50"
                        style={{ width: `${progressPercentage}%` }}
                      />
                      {/* Step indicators */}
                      <div className="relative flex justify-between items-center">
                        {[1, 2, 3].map((stepNumber) => (
                          <div key={stepNumber} className="flex flex-col items-center">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 transform ${
                                stage >= stepNumber
                                  ? 'bg-gradient-to-br from-cyan-400 to-emerald-400 text-white scale-110 shadow-2xl shadow-cyan-400/70'
                                  : 'bg-white/40 text-blue-800 backdrop-blur-sm border-2 border-white/50'
                              } ${stage === stepNumber ? 'animate-pulse' : ''}`}
                            >
                              {stepNumber === 1 ? <Target className="w-6 h-6" /> : 
                               stepNumber === 2 ? <Sparkles className="w-6 h-6" /> : 
                               <Zap className="w-6 h-6" />}
                            </div>
                            <div className={`mt-2 text-center transition-all duration-300 ${
                              stage >= stepNumber ? 'text-white' : 'text-blue-900'
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
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-3xl blur-xl" />
              
              <Card className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-700 shadow-2xl rounded-3xl overflow-hidden">
                <div className="relative bg-gradient-to-r from-gray-800/95 to-gray-900/95 p-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 opacity-70 animate-pulse" />
                  <CardHeader className="relative z-10 p-0">
                  <Button className = "absolute top-0 right-0" onClick={() => router.push("/") }>
          Back to dashboard
        </Button>
                    <div className="flex items-center space-x-3 mb-2">
                      <Sparkles className="w-8 h-8 text-white" />
                      <CardTitle className="text-3xl font-bold text-white">Create Prompt Variants</CardTitle>
                    </div>
                    <CardDescription className="text-white/90 text-lg">
                      Design multiple prompt variations to test and compare
                    </CardDescription>
                  </CardHeader>
                </div>

                <CardContent className="p-8 space-y-6">
                  {prompts.map((prompt, index) => (
                    <div key={prompt.id} className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg font-semibold text-white">Variant {index + 1}</span>
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
                              className="text-white/70 hover:text-white hover:bg-red-500/20 rounded-lg"
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
                          className="bg-white/10 border-white/20 text-white placeholder-white/50 text-base p-4 rounded-xl backdrop-blur-sm focus:bg-white/20 focus:border-blue-400/50 focus:ring-4 focus:ring-blue-400/20 transition-all duration-300 resize-none w-full"
                        />
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-center">
                    <Button 
                      onClick={addPrompt} 
                      variant="outline" 
                      className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-6 py-3 rounded-xl backdrop-blur-sm transition-all duration-300"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add New Variant
                    </Button>
                  </div>
                </CardContent>

                <div className="p-8 pt-0 flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setStage(1)} 
                    className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-6 py-3 rounded-xl backdrop-blur-sm"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={() => setStage(3)} 
                    className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white px-8 py-3 font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    Optimize Prompts
                    <Zap className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </Card>
            </div>
             {/* Progress/Stepper UI under the card for stage 1, but outside the card */}
             <div className="mt-8 px-2">
                <div className="transition-all duration-1000 ease-out transform translate-y-0 opacity-100">
                  <div className="mb-2">
                    <div className="relative">
                      {/* Progress track */}
                      <div className="absolute top-1/2 left-0 right-0 h-2 bg-white/30 rounded-full backdrop-blur-sm -translate-y-1/2" />
                      <div 
                        className="absolute top-1/2 left-0 h-2 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full -translate-y-1/2 transition-all duration-1000 ease-out shadow-lg shadow-cyan-400/50"
                        style={{ width: `${progressPercentage}%` }}
                      />
                      {/* Step indicators */}
                      <div className="relative flex justify-between items-center">
                        {[1, 2, 3].map((stepNumber) => (
                          <div key={stepNumber} className="flex flex-col items-center">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 transform ${
                                stage >= stepNumber
                                  ? 'bg-gradient-to-br from-cyan-400 to-emerald-400 text-white scale-110 shadow-2xl shadow-cyan-400/70'
                                  : 'bg-white/40 text-blue-800 backdrop-blur-sm border-2 border-white/50'
                              } ${stage === stepNumber ? 'animate-pulse' : ''}`}
                            >
                              {stepNumber === 1 ? <Target className="w-6 h-6" /> : 
                               stepNumber === 2 ? <Sparkles className="w-6 h-6" /> : 
                               <Zap className="w-6 h-6" />}
                            </div>
                            <div className={`mt-2 text-center transition-all duration-300 ${
                              stage >= stepNumber ? 'text-white' : 'text-blue-900'
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
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-3xl blur-xl" />
              
              <Card className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-700 shadow-2xl rounded-3xl overflow-hidden">
                <div className="relative bg-gradient-to-r from-gray-800/95 to-gray-900/95 p-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 opacity-70 animate-pulse" />
                  <CardHeader className="relative z-10 p-0">
                  <Button className = "absolute top-0 right-0" onClick={() => router.push("/") }>
          Back to dashboard
        </Button>
                    <div className="flex items-center space-x-3 mb-2">
                      <Zap className="w-8 h-8 text-white" />
                      <CardTitle className="text-3xl font-bold text-white">Optimize & Analyze</CardTitle>
                    </div>
                    <CardDescription className="text-white/90 text-lg">
                      Review performance metrics and refine your prompts
                    </CardDescription>
                  </CardHeader>
                </div>

                <CardContent className="p-8 space-y-6">
                  {prompts.map((prompt, index) => (
                    <div key={prompt.id} className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg font-semibold text-white">Variant {index + 1}</span>
                            <Badge className={`${getStatusColor(prompt.status)} border`}>
                              {getStatusIcon(prompt.status)}
                              <span className="ml-2 capitalize">{prompt.status}</span>
                            </Badge>
                          </div>
                        </div>
                        <Textarea
                          placeholder="Optimized prompt..."
                          value={prompt.content}
                          onChange={(e) => updatePrompt(prompt.id, e.target.value)}
                          rows={4}
                          className="bg-white/10 border-white/20 text-white placeholder-white/50 text-base p-4 rounded-xl backdrop-blur-sm focus:bg-white/20 focus:border-emerald-400/50 focus:ring-4 focus:ring-emerald-400/20 transition-all duration-300 resize-none w-full mb-4"
                        />
                        
                        {prompt.status === "completed" && (
                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-emerald-500/20 border border-emerald-400/30 p-4 rounded-xl backdrop-blur-sm">
                              <p className="text-emerald-300 font-medium text-sm">Quality Score</p>
                              <p className="text-2xl font-bold text-emerald-400">{prompt.score || 8.5}/10</p>
                            </div>
                            <div className="bg-blue-500/20 border border-blue-400/30 p-4 rounded-xl backdrop-blur-sm">
                              <p className="text-blue-300 font-medium text-sm">Tokens Used</p>
                              <p className="text-2xl font-bold text-blue-400">{prompt.tokens || 245}</p>
                            </div>
                            <div className="bg-cyan-500/20 border border-cyan-400/30 p-4 rounded-xl backdrop-blur-sm">
                              <p className="text-cyan-300 font-medium text-sm">Response Time</p>
                              <p className="text-2xl font-bold text-cyan-400">{prompt.responseTime || 1250}ms</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>

                <div className="p-8 pt-0 flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setStage(2)} 
                    className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-6 py-3 rounded-xl backdrop-blur-sm"
                  >
                    Back
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white px-8 py-3 font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Run Evaluation
                  </Button>
                </div>
              </Card>
            </div>
             {/* Progress/Stepper UI under the card for stage 1, but outside the card */}
             <div className="mt-8 px-2">
             <div className="transition-all duration-1000 ease-out transform translate-y-0 opacity-100">
               <div className="mb-2">
                 <div className="relative">
                   {/* Progress track */}
                   <div className="absolute top-1/2 left-0 right-0 h-2 bg-white/30 rounded-full backdrop-blur-sm -translate-y-1/2" />
                   <div 
                     className="absolute top-1/2 left-0 h-2 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full -translate-y-1/2 transition-all duration-1000 ease-out shadow-lg shadow-cyan-400/50"
                     style={{ width: `${progressPercentage}%` }}
                   />
                   {/* Step indicators */}
                   <div className="relative flex justify-between items-center">
                     {[1, 2, 3].map((stepNumber) => (
                       <div key={stepNumber} className="flex flex-col items-center">
                         <div
                           className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 transform ${
                             stage >= stepNumber
                               ? 'bg-gradient-to-br from-cyan-400 to-emerald-400 text-white scale-110 shadow-2xl shadow-cyan-400/70'
                               : 'bg-white/40 text-blue-800 backdrop-blur-sm border-2 border-white/50'
                           } ${stage === stepNumber ? 'animate-pulse' : ''}`}
                         >
                           {stepNumber === 1 ? <Target className="w-6 h-6" /> : 
                            stepNumber === 2 ? <Sparkles className="w-6 h-6" /> : 
                            <Zap className="w-6 h-6" />}
                         </div>
                         <div className={`mt-2 text-center transition-all duration-300 ${
                           stage >= stepNumber ? 'text-white' : 'text-blue-900'
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