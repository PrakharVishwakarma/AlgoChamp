// apps/web/components/landing/CTASection.tsx

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary/10 via-background to-info/10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Background Elements */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-info/20 rounded-3xl blur-3xl"></div>
            
            <div className="relative bg-card/40 backdrop-blur-xl border border-border rounded-3xl p-12 md:p-16">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4" />
                Ready to Level Up?
              </div>

              {/* Heading */}
              <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Start Your{" "}
                <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
                  Coding Journey
                </span>{" "}
                Today
              </h2>

              {/* Description */}
              <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                Join thousands of developers who are already mastering algorithms and advancing their careers with AlgoChamp. 
                Your next breakthrough is just one problem away.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link 
                  href="/register"
                  className="group inline-flex items-center gap-3 px-10 py-5 bg-primary text-primary-foreground rounded-xl font-bold text-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-primary/90"
                >
                  Create Free Account
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link 
                  href="/problems"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-card border border-border text-foreground rounded-xl font-bold text-xl hover:bg-accent hover:border-primary/50 transition-all duration-300"
                >
                  Try Problems First
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 pt-8 border-t border-border">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    Free to start
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    No credit card required
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    Cancel anytime
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}