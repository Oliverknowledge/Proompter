import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  BarChart3, 
  Target, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  Shield,
  Clock,
  TrendingUp
} from "lucide-react";
import ThreeBackground from "./ThreeBackground";
import { Typewriter } from 'react-simple-typewriter';
import { motion } from 'framer-motion';

interface HomepageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const Homepage = ({ onGetStarted, onSignIn }: HomepageProps) => {
  const features = [
    {
      icon: Target,
      title: "Smart Prompt Testing",
      description: "Test multiple prompt variations side-by-side with real-time AI evaluation and scoring."
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Track quality scores, token usage, response times, and cost metrics across all experiments."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share experiments with your team, manage projects together, and build a prompt library."
    },
    {
      icon: Sparkles,
      title: "A/B Testing",
      description: "Run batch experiments to automatically find the best-performing prompts for your use case."
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      description: "Built-in hallucination detection and relevance scoring to ensure prompt reliability."
    },
    {
      icon: Clock,
      title: "Trace & Debug",
      description: "Complete visibility into API calls, timing, and errors with detailed trace logs."
    }
  ];

  const benefits = [
    "Reduce prompt engineering time by 80%",
    "Improve AI output quality consistently",
    "Lower AI costs through optimization",
    "Scale prompt management across teams"
  ];

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      <ThreeBackground />

      {/* Header */}
      <header className="border-b bg-gray-900 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-500" />
              </div>
              <h1 className="text-2xl font-bold text-green-500">
                Proompter
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="bg-white text-gray-900 border-2 border-cyan-400 hover:border-green-400 shadow-cyan-400/30 hover:shadow-green-400/40 transition-shadow" onClick={onSignIn}>
                Sign In
              </Button>
              <Button 
                onClick={onGetStarted}
                className="bg-white text-gray-900 border-2 border-green-400 hover:border-cyan-400 shadow-green-400/30 hover:shadow-cyan-400/40 transition-shadow"
              >
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative z-10 overflow-hidden flex items-center justify-center min-h-[600px]" style={{ background: 'transparent', paddingTop: '6rem', paddingBottom: '6rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="relative z-10 w-full flex flex-col items-start justify-center h-full text-left px-4 max-w-4xl mx-auto"
          >
            <Badge className="mb-6 bg-gradient-to-r from-blue-700 via-green-500 to-cyan-400 text-white border-none shadow-lg">
              ✨ AI Prompt Optimization Platform
            </Badge>
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-white drop-shadow-lg">
              <span>Optimize Your AI Prompts with </span>
              <span className="inline-block text-cyan-300">
                <Typewriter
                  words={["Data-Driven Insights", "A/B Testing", "Team Collaboration", "Real-Time Analytics"]}
                  loop={0}
                  cursor
                  cursorStyle="_"
                  typeSpeed={60}
                  deleteSpeed={40}
                  delaySpeed={1800}
                />
              </span>
            </h2>
            <p className="text-lg text-cyan-100 mb-8 leading-relaxed max-w-2xl">
              Test, compare, and optimize AI prompts with <span className="text-green-300 font-semibold">real-time evaluation</span>, <span className="text-blue-300 font-semibold">A/B testing</span>, and <span className="text-cyan-300 font-semibold">team collaboration</span>.<br />
              <span className="text-cyan-200">Stop guessing—start measuring what works.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-start">
              <Button 
                size="lg"
                onClick={onGetStarted}
                className="bg-gradient-to-r from-green-400 via-blue-400 to-cyan-400 text-gray-900 border-2 border-green-400 hover:border-cyan-400 text-lg px-8 py-3 font-bold shadow-lg hover:from-green-500 hover:to-blue-500 hover:scale-105 transition-transform shadow-green-400/30 hover:shadow-cyan-400/40"
              >
                Start today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="bg-white/80 text-gray-900 border-2 border-cyan-400 hover:border-green-400 text-lg px-8 py-3 font-bold shadow-md hover:bg-white shadow-cyan-400/30 hover:shadow-green-400/40">
                Watch Demo
              </Button>
            </div>
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span className="text-sm font-medium text-cyan-100">{benefit}</span>
                </div>
              ))}
            </div>
          </motion.div>
          {/* Decorative gradient blobs for extra color */}
          <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-gradient-to-br from-blue-500 via-cyan-400 to-green-300 opacity-30 rounded-full blur-3xl z-0" />
          <div className="absolute top-40 right-0 w-[300px] h-[300px] bg-gradient-to-br from-green-400 via-blue-400 to-cyan-300 opacity-30 rounded-full blur-2xl z-0" />
        </section>

        {/* Features Section */}
        <section className="py-32 px-6 relative z-10" style={{ background: 'transparent' }}>
          <div className="container mx-auto">
            <div className="text-center mb-20">
              <h3 className="text-4xl font-extrabold mb-4 text-white drop-shadow-lg">Everything you need to master prompt engineering</h3>
              <p className="text-cyan-100 max-w-2xl mx-auto text-lg">From testing and evaluation to team collaboration and optimization—Proompter provides all the tools you need in one integrated platform.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {features.map((feature, index) => (
                <div key={index} className="rounded-2xl bg-gradient-to-br from-blue-900/60 via-cyan-900/40 to-green-900/30 border border-blue-700/30 shadow-xl p-8 flex flex-col items-center hover:scale-105 transition-transform">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 via-green-400 to-cyan-400 rounded-xl flex items-center justify-center mb-5 shadow-lg">
                    <feature.icon className="w-7 h-7 text-cyan-100" />
                  </div>
                  <h4 className="text-xl font-bold text-cyan-100 mb-2 text-center">{feature.title}</h4>
                  <p className="text-cyan-200 text-center text-base">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-32 px-6 relative z-10" style={{ background: 'transparent' }}>
          <div className="container mx-auto">
            <div className="bg-gradient-to-br from-blue-900/70 via-cyan-900/50 to-green-900/30 rounded-3xl p-16 text-center shadow-2xl border border-blue-700/30">
              <h3 className="text-4xl font-extrabold mb-10 text-white drop-shadow-lg">Trusted by teams worldwide</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                <div>
                  <div className="text-5xl font-extrabold mb-2 text-cyan-200">10K+</div>
                  <div className="text-cyan-100 text-lg">Prompts tested</div>
                </div>
                <div>
                  <div className="text-5xl font-extrabold mb-2 text-green-200">500+</div>
                  <div className="text-cyan-100 text-lg">Teams using</div>
                </div>
                <div>
                  <div className="text-5xl font-extrabold mb-2 text-blue-200">80%</div>
                  <div className="text-cyan-100 text-lg">Time saved</div>
                </div>
                <div>
                  <div className="text-5xl font-extrabold mb-2 text-cyan-200">95%</div>
                  <div className="text-cyan-100 text-lg">Quality improvement</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 bg-gradient-to-br from-blue-900/80 via-cyan-900/60 to-green-900/40 relative z-10">
          <div className="container mx-auto text-center max-w-3xl">
            <h3 className="text-4xl font-extrabold mb-6 text-white drop-shadow-lg">Ready to optimize your AI prompts?</h3>
            <p className="text-cyan-100 mb-10 text-xl">Join thousands of teams already using Proompter to build better AI applications. Start your free trial today—no credit card required.</p>
            <Button 
              size="lg"
              onClick={onGetStarted}
              className="bg-gradient-to-r from-green-400 via-blue-400 to-cyan-400 text-gray-900 border-2 border-green-400 hover:border-cyan-400 text-lg px-10 py-4 font-bold shadow-lg hover:from-green-500 hover:to-blue-500 hover:scale-105 transition-transform shadow-green-400/30 hover:shadow-cyan-400/40"
            >
              Start now
              <TrendingUp className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-md text-cyan-200 mt-6">Free 14-day trial • No credit card required • Cancel anytime</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-900 py-8 px-6 relative z-10">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-green-600 rounded flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Proompter</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 Proompter. All rights reserved. Made with ❤️ for AI builders.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
