// apps/web/components/landing/FeaturesSection.tsx

import Link from "next/link";
import { Target, Trophy, BarChart3, ArrowRight, Code2, Zap, Users } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Practice Problems",
    description: "Solve curated programming challenges from beginner to advanced levels. Master data structures and algorithms step by step.",
    color: "info",
    link: "/problems"
  },
  {
    icon: Trophy,
    title: "Contests",
    description: "Participate in timed contests and compete with programmers worldwide. Climb the leaderboard and earn recognition.",
    color: "warning",
    link: "/contests"
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Track your progress with detailed performance analytics and insights. Identify strengths and areas for improvement.",
    color: "success",
    link: "/analytics"
  }
];

const additionalFeatures = [
  {
    icon: Code2,
    title: "Multi-Language Support",
    description: "Write solutions in C++, Python, Java, JavaScript, and more. Choose your preferred programming language."
  },
  {
    icon: Zap,
    title: "Real-time Execution",
    description: "Get instant feedback with our fast code execution engine. Debug and optimize your solutions efficiently."
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Learn from a vibrant community of developers. Share knowledge, discuss solutions, and grow together."
  }
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
              Excel
            </span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Our comprehensive platform provides all the tools and resources you need to master competitive programming and advance your coding skills.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={feature.title}
                className="group bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-4 bg-${feature.color}/10 rounded-xl group-hover:bg-${feature.color}/20 transition-colors duration-300`}>
                    <IconComponent className={`w-8 h-8 text-${feature.color}`} />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground">{feature.title}</h3>
                </div>
                
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {feature.description}
                </p>
                
                <Link 
                  href={feature.link}
                  className={`inline-flex items-center gap-2 text-${feature.color} hover:text-${feature.color}/80 font-medium transition-colors group-hover:gap-3`}
                >
                  Explore Feature
                  <ArrowRight className="w-4 h-4 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Additional Features */}
        <div className="grid md:grid-cols-3 gap-8">
          {additionalFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={feature.title}
                className="text-center group"
                style={{ animationDelay: `${(index + 3) * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                  <IconComponent className="w-8 h-8 text-primary" />
                </div>
                
                <h4 className="text-xl font-semibold text-foreground mb-4">{feature.title}</h4>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}