// apps/web/components/landing/PricingSection.tsx

import Link from "next/link";
import { Check, Zap, Crown, Rocket } from "lucide-react";

const plans = [
  {
    name: "Free",
    icon: Zap,
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with competitive programming",
    features: [
      "Access to 100+ basic problems",
      "Community discussions",
      "Basic analytics",
      "Standard support"
    ],
    cta: "Get Started",
    href: "/register",
    popular: false,
    variant: "secondary" as const
  },
  {
    name: "Pro",
    icon: Crown,
    price: "$19",
    period: "per month",
    description: "Ideal for serious competitive programmers",
    features: [
      "Access to all 500+ problems",
      "Participate in all contests",
      "Advanced analytics & insights",
      "Priority support",
      "Mock interviews",
      "Custom practice sets"
    ],
    cta: "Start Pro Trial",
    href: "/register?plan=pro",
    popular: true,
    variant: "primary" as const
  },
  {
    name: "Team",
    icon: Rocket,
    price: "$99",
    period: "per month",
    description: "Perfect for teams and organizations",
    features: [
      "Everything in Pro",
      "Up to 50 team members",
      "Team analytics dashboard",
      "Custom contests",
      "Dedicated support manager",
      "API access"
    ],
    cta: "Contact Sales",
    href: "/contact",
    popular: false,
    variant: "success" as const
  }
];

export function PricingSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
              Plan
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Start free and upgrade as you grow. All plans include our core features with varying limits and premium additions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <div 
                key={plan.name}
                className={`relative bg-card/60 backdrop-blur-sm rounded-2xl p-8 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  plan.popular 
                    ? 'border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/20' 
                    : 'border-border hover:border-primary/50'
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.href}
                  className={`block w-full text-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    plan.variant === 'primary'
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl'
                      : plan.variant === 'success'
                      ? 'bg-success text-success-foreground hover:bg-success/90'
                      : 'bg-secondary text-secondary-foreground hover:bg-accent border border-border'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>

        {/* FAQ Link */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            Have questions about our plans?
          </p>
          <Link 
            href="/faq"
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            View Frequently Asked Questions →
          </Link>
        </div>
      </div>
    </section>
  );
}