import { type JSX, ReactNode } from "react";
import { LucideIcon, ExternalLink } from "lucide-react";

interface FeatureCardProps {
  className?: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  href?: string;
  children?: ReactNode;
}

export function FeatureCard({
  className = "",
  title,
  description,
  icon: Icon,
  iconColor = "text-blue-400",
  href,
  children,
}: FeatureCardProps): JSX.Element {
  const cardContent = (
    <div className={`
      bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 
      hover:border-gray-600 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
      ${href ? 'cursor-pointer' : ''}
      ${className}
    `}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 bg-gray-700/50 rounded-lg`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        {href && <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />}
      </div>
      <p className="text-gray-300 leading-relaxed">{description}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {cardContent}
      </a>
    );
  }

  return cardContent;
}