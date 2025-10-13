// apps/web/components/landing/TestimonialsSection.tsx

import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer at Google",
    avatar: "SC",
    content: "AlgoChamp transformed my problem-solving skills. The progressive difficulty and detailed explanations helped me land my dream job at Google.",
    rating: 5
  },
  {
    name: "Alex Rodriguez",
    role: "CS Student at MIT",
    avatar: "AR",
    content: "The contest platform is incredible! I've improved my competitive programming ranking significantly thanks to the regular practice and community support.",
    rating: 5
  },
  {
    name: "Priya Patel",
    role: "Full Stack Developer",
    avatar: "PP",
    content: "Perfect for interview preparation. The analytics feature helped me identify weak areas and the varied problem set covered everything I needed.",
    rating: 5
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            What Our{" "}
            <span className="bg-gradient-to-r from-primary to-info bg-clip-text text-transparent">
              Community
            </span>{" "}
            Says
          </h2>
          <p className="text-xl text-muted-foreground">
            Hear from developers who have transformed their coding journey with AlgoChamp.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.name}
              className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg group"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Quote Icon */}
              <div className="mb-6">
                <Quote className="w-8 h-8 text-primary/60" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground leading-relaxed mb-8 text-lg">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-info rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 text-center">
          <p className="text-muted-foreground mb-8">Trusted by developers from leading companies</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-2xl font-bold text-foreground">Google</div>
            <div className="text-2xl font-bold text-foreground">Microsoft</div>
            <div className="text-2xl font-bold text-foreground">Meta</div>
            <div className="text-2xl font-bold text-foreground">Amazon</div>
            <div className="text-2xl font-bold text-foreground">Apple</div>
            <div className="text-2xl font-bold text-foreground">Netflix</div>
          </div>
        </div>
      </div>
    </section>
  );
}