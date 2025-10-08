"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "success" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

export const Button = ({ 
  onClick, 
  children, 
  icon: Icon, 
  variant = "primary", 
  size = "md", 
  disabled = false,
  className = "" 
}: ButtonProps) => {
  const baseClasses = "font-semibold rounded-lg shadow-md transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background";
  
  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:opacity-90 focus:ring-primary",
    secondary: "bg-secondary text-secondary-foreground hover:bg-accent focus:ring-ring", 
    success: "bg-success text-success-foreground hover:opacity-90 focus:ring-success",
    danger: "bg-destructive text-destructive-foreground hover:opacity-90 focus:ring-destructive"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-2 text-lg", 
    lg: "px-8 py-3 text-xl"
  };
  
  const disabledClasses = disabled 
    ? "opacity-50 cursor-not-allowed" 
    : "hover:scale-105 active:scale-95";

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`
        ${baseClasses} 
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${disabledClasses}
        ${className}
        ${Icon ? 'flex items-center gap-2' : ''}
      `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};