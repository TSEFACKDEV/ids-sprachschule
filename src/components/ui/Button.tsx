"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-ids-red text-ids-white hover:bg-red-700 border-transparent",
  secondary:
    "bg-ids-black text-ids-white hover:bg-gray-800 border-transparent",
  outline:
    "bg-transparent text-ids-black border-ids-black hover:bg-ids-black hover:text-ids-white",
  ghost:
    "bg-transparent text-ids-red border-transparent hover:bg-red-50",
  danger:
    "bg-red-600 text-white hover:bg-red-700 border-transparent",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  type = "button",
  onClick,
  className = "",
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.15 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        font-semibold border-2 rounded-lg
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-ids-red focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {loading ? (
        <>
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Chargement...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}