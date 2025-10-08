// apps/web/components/Logo.tsx

"use client";

import Image from "next/image";
import { useTheme } from "../context/ThemeContext";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  priority?: boolean; // For above-the-fold images
}

const sizeMap = {
  sm: { width: 120, height: 40 },
  md: { width: 160, height: 54 },
  lg: { width: 200, height: 68 },
  xl: { width: 240, height: 81 },
};

export const Logo = ({ size = "md", className = "", priority = false }: LogoProps) => {
  const { resolvedTheme } = useTheme();
  const dimensions = sizeMap[size];
  
  // Choose logo based on resolved theme
  const logoSrc = resolvedTheme === "dark" ? "/dark-logo.svg" : "/light-logo.svg";
  const alt = "AlgoChamp - Competitive Programming Platform";

  return (
    <Image
      src={logoSrc}
      alt={alt}
      width={dimensions.width}
      height={dimensions.height}
      className={`transition-opacity duration-300 ${className}`}
      priority={priority} // Important for logos above the fold
      style={{
        width: "auto",
        height: "auto",
        maxWidth: dimensions.width,
        maxHeight: dimensions.height,
      }}
    />
  );
};