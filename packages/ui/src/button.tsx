"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
}

export const Button = ({ onClick, children }: ButtonProps) => {
  return (
    <button onClick={onClick} className="px-6 py-2 text-lg font-semibold bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 hover:scale-105 transition duration-300">
      {children}
    </button>

  );
};