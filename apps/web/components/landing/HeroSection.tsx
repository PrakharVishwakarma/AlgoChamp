// apps/web/components/landing/HeroSection.tsx

import Link from "next/link";
import { ArrowRight, Code, Sparkles } from "lucide-react";
import { Logo } from "../Logo";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-secondary/5 to-background">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-info/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-accent/8 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20"></div>

      <div className="relative z-10 container mx-auto px-4 py-32">
        <div className="text-center max-w-5xl mx-auto">
          {/* Logo */}
          <div className="mb-12 animate-in fade-in duration-1000">
            <Logo size="xl" priority className="mx-auto" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-8 animate-in slide-in-from-top duration-700 delay-200">
            <Sparkles className="w-4 h-4" />
            Competitive Programming Platform
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 leading-tight animate-in slide-in-from-bottom duration-700 delay-300">
            Master Algorithms with{" "}
            <span className="bg-gradient-to-r from-primary via-info to-primary bg-clip-text text-transparent">
              AlgoChamp
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed animate-in slide-in-from-bottom duration-700 delay-500">
            Elevate your competitive programming skills with our comprehensive platform. 
            Practice problems, participate in contests, and join a thriving community of developers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 animate-in slide-in-from-bottom duration-700 delay-700">
            <Link 
              href="/register"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-primary/90"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="/problems"
              className="inline-flex items-center gap-3 px-8 py-4 bg-card border border-border text-foreground rounded-xl font-semibold text-lg hover:bg-accent hover:border-primary/50 transition-all duration-300"
            >
              <Code className="w-5 h-5" />
              Browse Problems
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto animate-in fade-in duration-700 delay-1000">
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Problems</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">10K+</div>
              <div className="text-sm text-muted-foreground">Developers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">50+</div>
              <div className="text-sm text-muted-foreground">Contests</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}