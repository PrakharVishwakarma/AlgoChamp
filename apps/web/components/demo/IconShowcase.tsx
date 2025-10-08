// apps/web/components/demo/IconShowcase.tsx

"use client";

import { 
  Code2, Trophy, BarChart3, Target, Users, Clock, 
  User, Mail, LogOut, Shield, Eye, EyeOff, 
  AlertTriangle, Loader2, CheckCircle, XCircle, 
  Info, ChevronRight, ExternalLink, Settings,
  BookOpen, Calendar, Award, TrendingUp, Star,
  Github, Linkedin, Twitter, Zap, Heart
} from "lucide-react";

const iconCategories = {
  "Core Platform": [
    { icon: Code2, name: "Code2", description: "Programming/coding" },
    { icon: Trophy, name: "Trophy", description: "Contests/achievements" },
    { icon: BarChart3, name: "BarChart3", description: "Analytics/statistics" },
    { icon: Target, name: "Target", description: "Goals/practice" },
    { icon: Users, name: "Users", description: "Community/users" },
    { icon: Clock, name: "Clock", description: "Time/duration" },
  ],
  "User Interface": [
    { icon: User, name: "User", description: "User profile" },
    { icon: Mail, name: "Mail", description: "Email/contact" },
    { icon: LogOut, name: "LogOut", description: "Sign out" },
    { icon: Shield, name: "Shield", description: "Security/protection" },
    { icon: Eye, name: "Eye", description: "Show password" },
    { icon: EyeOff, name: "EyeOff", description: "Hide password" },
  ],
  "Feedback & Status": [
    { icon: AlertTriangle, name: "AlertTriangle", description: "Warnings/errors" },
    { icon: Loader2, name: "Loader2", description: "Loading states" },
    { icon: CheckCircle, name: "CheckCircle", description: "Success messages" },
    { icon: XCircle, name: "XCircle", description: "Error messages" },
    { icon: Info, name: "Info", description: "Information" },
    { icon: ChevronRight, name: "ChevronRight", description: "Navigation" },
  ],
  "Additional Features": [
    { icon: ExternalLink, name: "ExternalLink", description: "External links" },
    { icon: Settings, name: "Settings", description: "Configuration" },
    { icon: BookOpen, name: "BookOpen", description: "Documentation" },
    { icon: Calendar, name: "Calendar", description: "Scheduling" },
    { icon: Award, name: "Award", description: "Badges/rewards" },
    { icon: TrendingUp, name: "TrendingUp", description: "Progress" },
    { icon: Star, name: "Star", description: "Favorites/rating" },
    { icon: Zap, name: "Zap", description: "Performance/speed" },
    { icon: Heart, name: "Heart", description: "Likes/favorites" },
  ],
  "Social & External": [
    { icon: Github, name: "Github", description: "GitHub integration" },
    { icon: Linkedin, name: "Linkedin", description: "LinkedIn" },
    { icon: Twitter, name: "Twitter", description: "Twitter/X" },
  ]
};

export const IconShowcase = () => {
  return (
    <div className="p-6 bg-gray-800/30 rounded-lg border border-gray-700">
      <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
        <Star className="w-6 h-6 text-yellow-400" />
        Lucide React Icons Showcase
      </h3>
      
      <div className="space-y-8">
        {Object.entries(iconCategories).map(([category, icons]) => (
          <div key={category} className="space-y-4">
            <h4 className="text-lg font-medium text-blue-400 border-b border-gray-700 pb-2">
              {category}
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {icons.map(({ icon: Icon, name, description }) => (
                <div 
                  key={name}
                  className="flex flex-col items-center p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <Icon className="w-8 h-8 text-gray-300 mb-2" />
                  <span className="text-sm font-medium text-white text-center">{name}</span>
                  <span className="text-xs text-gray-400 text-center mt-1">{description}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h5 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Usage Guidelines
        </h5>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Import icons individually for better tree-shaking</li>
          <li>• Use consistent sizing (w-4 h-4, w-5 h-5, w-6 h-6)</li>
          <li>• Apply theme-appropriate colors (blue-400, green-400, red-400, etc.)</li>
          <li>• Consider accessibility with proper aria-labels</li>
        </ul>
      </div>
    </div>
  );
};