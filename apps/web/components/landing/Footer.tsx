// apps/web/components/landing/Footer.tsx

import Link from "next/link";
import { Github, Twitter, Linkedin, Mail, Heart } from "lucide-react";
import { Logo } from "../Logo";

const footerSections = [
  {
    title: "Platform",
    links: [
      { name: "Problems", href: "/problems" },
      { name: "Contests", href: "/contests" },
      { name: "Leaderboard", href: "/leaderboard" },
      { name: "Analytics", href: "/analytics" }
    ]
  },
  {
    title: "Resources",
    links: [
      { name: "Documentation", href: "/docs" },
      { name: "API Reference", href: "/api-docs" },
      { name: "Tutorials", href: "/tutorials" },
      { name: "Blog", href: "/blog" }
    ]
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/contact" },
      { name: "Press Kit", href: "/press" }
    ]
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "GDPR", href: "/gdpr" }
    ]
  }
];

const socialLinks = [
  { name: "GitHub", href: "https://github.com/algochamp", icon: Github },
  { name: "Twitter", href: "https://twitter.com/algochamp", icon: Twitter },
  { name: "LinkedIn", href: "https://linkedin.com/company/algochamp", icon: Linkedin },
  { name: "Email", href: "mailto:hello@algochamp.com", icon: Mail }
];

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-6 gap-12 mb-12">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Logo size="md" />
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Empowering developers worldwide to master algorithms and excel in competitive programming. 
              Join our community and unlock your coding potential.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-300"
                    aria-label={social.name}
                  >
                    <IconComponent className="w-5 h-5" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-foreground mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="bg-muted/30 rounded-2xl p-8 mb-12">
          <div className="max-w-md">
            <h3 className="text-xl font-semibold text-foreground mb-2">Stay Updated</h3>
            <p className="text-muted-foreground mb-6">
              Get the latest problems, contest announcements, and coding tips delivered to your inbox.
            </p>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border">
          <p className="text-muted-foreground text-sm mb-4 md:mb-0">
            © 2025 AlgoChamp. All rights reserved.
          </p>
          
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>for the coding community</span>
          </div>
        </div>
      </div>
    </footer>
  );
}