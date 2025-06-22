"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, TrendingUp, BarChart3, Activity, Target, Sparkles, Zap, Award, Clock, Coins, Brain, Router } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ComposedChart, Bar, BarChart, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, ScatterChart, Scatter } from 'recharts';
import * as THREE from 'three';
import { useRouter, useSearchParams } from 'next/navigation';

const ThreeJSBackground = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) => {
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    // Create geometric shapes with enhanced materials
    const shapes: THREE.Mesh[] = [];
    
    const geometries = [
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.OctahedronGeometry(1.5),
      new THREE.TetrahedronGeometry(1.8),
      new THREE.IcosahedronGeometry(1.2)
    ];

    for (let i = 0; i < 15; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const colorOptions = [0x00ff88, 0x0088ff, 0x88ff00, 0xff6b6b, 0xffd93d, 0x6bcf7f];
      const material = new THREE.MeshBasicMaterial({
        color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
        wireframe: true,
        transparent: true,
        opacity: 0.25
      });
      
      const shape = new THREE.Mesh(geometry, material);
      shape.position.set(
        (Math.random() - 0.5) * 35,
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25
      );
      shape.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      shape.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.015,
          y: (Math.random() - 0.5) * 0.015,
          z: (Math.random() - 0.5) * 0.015
        }
      };
      
      shapes.push(shape);
      scene.add(shape);
    }

    // Enhanced particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 150;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 60;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00ff88,
      size: 0.15,
      transparent: true,
      opacity: 0.7
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    camera.position.z = 18;

    const animate = () => {
      requestAnimationFrame(animate);
      
      shapes.forEach((shape: THREE.Mesh) => {
        shape.rotation.x += shape.userData.rotationSpeed.x;
        shape.rotation.y += shape.userData.rotationSpeed.y;
        shape.rotation.z += shape.userData.rotationSpeed.z;
      });
      
      particles.rotation.y += 0.0008;
      particles.rotation.x += 0.0003;
      
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
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return null;
};

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}

const MetricCard = ({ title, value, change, icon: Icon, color, subtitle }: MetricCardProps) => (
  <Card className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-slate-700/50 backdrop-blur-md overflow-hidden group hover:scale-[1.02] transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/20 hover:border-emerald-500/40">
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
    <CardContent className="relative p-6 z-10">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-slate-400 text-sm font-medium">{title}</p>
            {change !== undefined && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-2 py-0.5 text-xs">
                +{change}%
              </Badge>
            )}
          </div>
          <p className={`text-3xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent mb-1`}>{value}</p>
          {subtitle && (
            <p className="text-slate-500 text-sm">{subtitle}</p>
          )}
        </div>
        <div className={`p-4 rounded-xl bg-gradient-to-br ${color.replace('text-', 'from-').replace('-400', '-500/20')} to-transparent group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
          <Icon className={`w-8 h-8 ${color} group-hover:drop-shadow-lg transition-all duration-300`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Custom Tooltip Components
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 shadow-2xl">
        <p className="text-slate-300 font-medium mb-2">{`Prompt ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {`${entry.dataKey}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const RadarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-3 shadow-2xl">
        <p className="text-emerald-400 font-medium">{payload[0].payload.metric}</p>
        <p className="text-slate-300 text-sm">{`Score: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export default function OptimizationResults() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [championExpanded, setChampionExpanded] = useState(false);

  // Parse real data from URL
  const searchParams = useSearchParams();
  const resultParam = searchParams.get('result');
  let result: any = null;
  try {
    result = resultParam ? JSON.parse(resultParam) : null;
  } catch {
    result = null;
  }

  // Extract real data
  const bestPrompt = result?.best_prompt || {};
  const ctaReason = result?.cta_reason || '';
  const trials = Array.isArray(result?.trials) ? result.trials : [];

  // Toggle expanded state for a card
  const toggleExpanded = (cardIndex: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardIndex)) {
      newExpanded.delete(cardIndex);
    } else {
      newExpanded.add(cardIndex);
    }
    setExpandedCards(newExpanded);
  };

  // Toggle champion prompt expansion
  const toggleChampionExpanded = () => {
    setChampionExpanded(!championExpanded);
  };

  // Prepare chart data from real trials
  const chartData = trials.map((trial: any, index: number) => ({
    name: `P${index + 1}`,
    score: Number(trial.score),
    relevance: Number(trial.relevance_score),
    hallucination: Number(trial.hallucination_score),
    emotional: Number(trial.emotional_score),
    cta: Number(trial.cta_score),
    latency: typeof trial.prompt?.latency === 'string' ? parseFloat(trial.prompt.latency.replace('s', '')) : Number(trial.prompt?.latency || 0),
    tokens: Number(trial.prompt?.tokens || 0)
  }));

 
    const router = useRouter();
  const performanceData = chartData.map((item: any, index: number) => ({
    x: item.latency,
    y: item.score,
    z: item.tokens,
    name: item.name
  }));

  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  // Fallbacks for metrics
  const avgScore = trials.length ? (trials.reduce((acc: number, t: any) => acc + Number(t.score || 0), 0) / trials.length).toFixed(1) : '0.0';
  const scoreRange = trials.length ? (Math.max(...trials.map((t: any) => Number(t.score || 0))) - Math.min(...trials.map((t: any) => Number(t.score || 0)))).toFixed(1) : '0.0';
  const avgTokens = trials.length ? (trials.reduce((acc: number, t: any) => acc + Number(t.prompt?.tokens || 0), 0) / trials.length).toFixed(0) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <div ref={containerRef} className="fixed inset-0 z-0" />
      <ThreeJSBackground containerRef={containerRef} />
      
      <div className="relative z-10 p-6 lg:p-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button className="bg-slate-800/80 border border-slate-600 text-slate-200 hover:bg-slate-700/80 hover:shadow-lg hover:shadow-slate-500/20 transition-all duration-300"
              onClick = {() => router.push("/")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <div className="text-right">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-2">
                Optimization Results
              </h1>
              <p className="text-slate-400">Performance analysis and insights</p>
            </div>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Best Score"
              value={bestPrompt.score}
              change={15.3}
              icon={Trophy}
              color="from-emerald-400 to-green-400 text-emerald-400"
              subtitle="out of 10.0"
            />
            <MetricCard
              title="Avg Latency"
              value="1.2s"
              change={8.7}
              icon={Clock}
              color="from-blue-400 to-cyan-400 text-blue-400"
              subtitle="response time"
            />
            <MetricCard
              title="Token Efficiency"
              value="156"
              change={12.1}
              icon={Coins}
              color="from-purple-400 to-pink-400 text-purple-400"
              subtitle="avg tokens"
            />
            <MetricCard
              title="Prompts Tested"
              value={trials.length}
              icon={Brain}
              color="from-orange-400 to-red-400 text-orange-400"
              subtitle="iterations"
            />
          </div>
        </div>

        {/* Champion Prompt Section */}
        <div className="max-w-7xl mx-auto mb-8">
          <Card className="relative bg-gradient-to-br from-emerald-900/40 via-blue-900/40 to-purple-900/40 border border-emerald-500/30 backdrop-blur-md overflow-hidden group hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <Trophy className="w-10 h-10 text-emerald-400 group-hover:drop-shadow-2xl" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-4xl bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent font-bold mb-2">
                    Champion Prompt
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-3 py-1">
                      Score: {bestPrompt.score}/10
                    </Badge>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-3 py-1">
                      {bestPrompt.latency} latency
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 px-3 py-1">
                      {bestPrompt.tokens} tokens
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-6 rounded-xl border border-slate-700/50 backdrop-blur-sm group-hover:border-emerald-500/30 transition-colors duration-300">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-emerald-400 font-semibold mb-2">Prompt</h4>
                        <p className={`text-slate-300 leading-relaxed ${championExpanded ? '' : 'line-clamp-3'}`}>
                          {bestPrompt.prompt}
                        </p>
                        {bestPrompt.prompt && bestPrompt.prompt.length > 150 && (
                          <button
                            onClick={toggleChampionExpanded}
                            className="mt-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors duration-200 font-medium"
                          >
                            {championExpanded ? 'Show Less' : 'Show All'}
                          </button>
                        )}
                      </div>
                      <div>
                        <h4 className="text-blue-400 font-semibold mb-2">Output</h4>
                        <p className={`text-slate-300 leading-relaxed ${championExpanded ? '' : 'line-clamp-3'}`}>
                          {bestPrompt.output}
                        </p>
                        {bestPrompt.output && bestPrompt.output.length > 150 && (
                          <button
                            onClick={toggleChampionExpanded}
                            className="mt-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors duration-200 font-medium"
                          >
                            {championExpanded ? 'Show Less' : 'Show All'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              
              </div>
              
              {ctaReason && (
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20 group-hover:border-blue-400/40 transition-colors duration-300">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">💡</div>
                    <div>
                      <h4 className="text-blue-400 font-semibold mb-2">AI Insight</h4>
                      <p className="text-slate-300 italic text-lg leading-relaxed">
                        {ctaReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Comparison Chart */}
            <Card className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-slate-700/50 backdrop-blur-md overflow-hidden hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3 text-xl font-bold">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-500/20">
                    <BarChart3 className="w-6 h-6 text-emerald-400" />
                  </div>
                  Performance Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                      <YAxis tick={{ fill: '#94a3b8' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="score" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Line type="monotone" dataKey="relevance" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Metric Breakdown */}
            <Card className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-slate-700/50 backdrop-blur-md overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3 text-xl font-bold">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                    <Target className="w-6 h-6 text-blue-400" />
                  </div>
                  Metric Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                      <YAxis tick={{ fill: '#94a3b8' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="emotional" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="cta" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="hallucination" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance vs Efficiency */}
        <div className="max-w-7xl mx-auto mb-8">
          <Card className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-slate-700/50 backdrop-blur-md overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-xl font-bold">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                Performance vs Efficiency Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                    <XAxis type="number" dataKey="x" name="Latency" unit="s" tick={{ fill: '#94a3b8' }} />
                    <YAxis type="number" dataKey="y" name="Score" tick={{ fill: '#94a3b8' }} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 shadow-2xl">
                              <p className="text-slate-300 font-medium mb-2">{data.name}</p>
                              <p className="text-emerald-400 text-sm">Score: {data.y}</p>
                              <p className="text-blue-400 text-sm">Latency: {data.x}s</p>
                              <p className="text-purple-400 text-sm">Tokens: {data.z}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter name="Prompts" dataKey="y" fill="#10b981">
                      {performanceData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Prompts Section */}
        <div className="max-w-7xl mx-auto mb-8">
          <Card className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-slate-700/50 backdrop-blur-md overflow-hidden">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-2xl font-bold">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-500/20">
                  <Activity className="w-7 h-7 text-emerald-400" />
                </div>
                All Prompt Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {trials.map((trial: any, idx: number) => (
                  <Card 
                    key={idx} 
                    className={`relative bg-gradient-to-br from-slate-800/90 via-slate-700/90 to-slate-800/90 border-slate-600/50 p-6 group hover:scale-[1.02] hover:shadow-xl transition-all duration-500 overflow-hidden cursor-pointer ${
                      hoveredCard === idx ? 'shadow-2xl shadow-emerald-500/20 border-emerald-500/40' : 'hover:shadow-emerald-500/10'
                    }`}
                    onMouseEnter={() => setHoveredCard(idx)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors[idx] ? `from-[${colors[idx]}] to-[${colors[idx]}]` : 'from-emerald-400 to-blue-400'}`}></div>
                          <div className="text-slate-200 font-semibold text-lg">Prompt {idx + 1}</div>
                          <Badge className={`${idx === 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-600/20 text-slate-400 border-slate-600/30'} px-2 py-1 text-xs`}>
                            {idx === 0 ? 'Best' : `#${idx + 1}`}
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold text-emerald-400">
                          {trial.score}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-sm">Relevance</span>
                            <span className="text-blue-400 font-medium">{trial.relevance_score}</span>
                          </div>
                          <div className="w-full bg-slate-700/50 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${(trial.relevance_score  * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-sm">Emotional</span>
                            <span className="text-purple-400 font-medium">{trial.emotional_score}</span>
                          </div>
                          <div className="w-full bg-slate-700/50 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${(trial.emotional_score * 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-sm">Hallucination</span>
                            <span className="text-orange-400 font-medium">{trial.hallucination_score}</span>
                          </div>
                          <div className="w-full bg-slate-700/50 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${(trial.hallucination_score * 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-sm">CTA Score</span>
                            <span className="text-emerald-400 font-medium">{trial.cta_score}</span>
                          </div>
                          <div className="w-full bg-slate-700/50 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${(trial.cta_score  * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/30 group-hover:border-slate-600/50 transition-colors duration-300">
                          <div className="text-xs text-slate-500 mb-1">PROMPT</div>
                          <p className={`text-slate-300 text-sm leading-relaxed ${expandedCards.has(idx) ? '' : 'line-clamp-2'}`}>
                            {trial.prompt.prompt}
                          </p>
                          {trial.prompt.prompt && trial.prompt.prompt.length > 100 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpanded(idx);
                              }}
                              className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors duration-200 font-medium"
                            >
                              {expandedCards.has(idx) ? 'Show Less' : 'Show All'}
                            </button>
                          )}
                        </div>
                        
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/30 group-hover:border-slate-600/50 transition-colors duration-300">
                          <div className="text-xs text-slate-500 mb-1">OUTPUT</div>
                          <p className={`text-slate-300 text-sm leading-relaxed ${expandedCards.has(idx) ? '' : 'line-clamp-2'}`}>
                            {trial.prompt.output}
                          </p>
                          {trial.prompt.output && trial.prompt.output.length > 100 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpanded(idx);
                              }}
                              className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors duration-200 font-medium"
                            >
                              {expandedCards.has(idx) ? 'Show Less' : 'Show All'}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-400 text-sm">{trial.prompt.latency}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Coins className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-400 text-sm">{trial.prompt.tokens}</span>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500">
                          Rank #{idx + 1}
                        </div>
                      </div>

                      {trial.cta_reason && (
                        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-3 rounded-lg border border-blue-500/20 group-hover:border-blue-400/30 transition-colors duration-300">
                          <div className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-blue-400 font-medium mb-1">INSIGHT</div>
                              <p className="text-slate-300 text-sm leading-relaxed">{trial.cta_reason}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Statistics */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-slate-700/50 backdrop-blur-md overflow-hidden hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400 mb-2">
                    {avgScore}
                  </div>
                  <div className="text-slate-400 text-sm mb-4">Average Score</div>
                  <div className="h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-slate-700/50 backdrop-blur-md overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {scoreRange}
                  </div>
                  <div className="text-slate-400 text-sm mb-4">Score Range</div>
                  <div className="h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <Bar dataKey="score" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 border-slate-700/50 backdrop-blur-md overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {avgTokens}
                  </div>
                  <div className="text-slate-400 text-sm mb-4">Avg Tokens</div>
                  <div className="h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <Area type="monotone" dataKey="tokens" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}