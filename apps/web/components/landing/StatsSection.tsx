// apps/web/components/landing/StatsSection.tsx

import { TrendingUp, Users, Code, Award } from "lucide-react";

const stats = [
  {
    icon: Code,
    value: "500+",
    label: "Coding Problems",
    description: "Carefully curated challenges across all difficulty levels"
  },
  {
    icon: Users,
    value: "10,000+",
    label: "Active Developers",
    description: "Growing community of passionate programmers"
  },
  {
    icon: TrendingUp,
    value: "1M+",
    label: "Solutions Submitted",
    description: "Code submissions and successful problem solves"
  },
  {
    icon: Award,
    value: "50+",
    label: "Contests Hosted",
    description: "Competitive programming events and challenges"
  }
];

export function StatsSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary/5 via-background to-info/5">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Trusted by{" "}
            <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Join a growing community of developers who are advancing their coding skills with AlgoChamp.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div 
                key={stat.label}
                className="text-center group"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-card border border-border rounded-2xl mb-6 group-hover:border-primary/50 group-hover:shadow-lg transition-all duration-300">
                  <IconComponent className="w-10 h-10 text-primary" />
                </div>
                
                <div className="text-4xl md:text-5xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {stat.value}
                </div>
                
                <div className="text-lg font-semibold text-foreground mb-2">
                  {stat.label}
                </div>
                
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}