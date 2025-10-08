// /apps/web/app/page.tsx

import { ClientNavigation } from "../components/ClientNavigation";
import { Target, Trophy, BarChart3, ArrowRight, Code, Users, Zap } from "lucide-react";
import Link from "next/link";
import { JSX } from "react";
import { Logo } from "../components/Logo";

export default function Page(): JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <ClientNavigation />
      
      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-info/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-20">
          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo */}
            <div className="mb-8">
              <Logo size="xl" priority className="mx-auto" />
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Competitive Programming Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Master Algorithms with{" "}
              <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
                AlgoChamp
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Elevate your competitive programming skills with our comprehensive platform. 
              Practice problems, participate in contests, and join a thriving community of developers.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link 
                href="/register"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href="/problems"
                className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-lg font-semibold text-lg border border-border hover:bg-accent transition-all duration-300"
              >
                <Code className="w-5 h-5" />
                Browse Problems
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto mb-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">500+</div>
                <div className="text-sm text-muted-foreground">Problems</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">10K+</div>
                <div className="text-sm text-muted-foreground">Developers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">50+</div>
                <div className="text-sm text-muted-foreground">Contests</div>
              </div>
            </div>
          </div>
          
          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group bg-card/60 backdrop-blur-sm rounded-xl p-8 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-info/10 rounded-xl group-hover:bg-info/20 transition-colors">
                  <Target className="w-8 h-8 text-info" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground">Practice Problems</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Solve curated programming challenges from beginner to advanced levels. Master data structures and algorithms step by step.
              </p>
              <Link 
                href="/problems" 
                className="inline-flex items-center gap-2 text-info hover:text-info/80 font-medium transition-colors"
              >
                Start Practicing
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="group bg-card/60 backdrop-blur-sm rounded-xl p-8 border border-border hover:border-warning/50 transition-all duration-300 hover:shadow-lg hover:shadow-warning/10 hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-warning/10 rounded-xl group-hover:bg-warning/20 transition-colors">
                  <Trophy className="w-8 h-8 text-warning" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground">Contests</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Participate in timed contests and compete with programmers worldwide. Climb the leaderboard and earn recognition.
              </p>
              <Link 
                href="/contests" 
                className="inline-flex items-center gap-2 text-warning hover:text-warning/80 font-medium transition-colors"
              >
                Join Contests
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="group bg-card/60 backdrop-blur-sm rounded-xl p-8 border border-border hover:border-success/50 transition-all duration-300 hover:shadow-lg hover:shadow-success/10 hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-success/10 rounded-xl group-hover:bg-success/20 transition-colors">
                  <BarChart3 className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground">Analytics</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Track your progress with detailed performance analytics and insights. Identify strengths and areas for improvement.
              </p>
              <Link 
                href="/dashboard" 
                className="inline-flex items-center gap-2 text-success hover:text-success/80 font-medium transition-colors"
              >
                View Analytics
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          {/* Community Section */}
          <div className="mt-24 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/50 border border-border rounded-full text-foreground text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              Join Our Community
            </div>
            
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Learn Together, Grow Together
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with fellow developers, share solutions, and learn from the community.
            </p>
            
            <Link 
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 transition-colors"
            >
              Join AlgoChamp
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}