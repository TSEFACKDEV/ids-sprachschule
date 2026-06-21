import type { ReactNode } from "react";
import type { StatutInscription } from "@/types";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "gold"
  | "gray";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-orange-100 text-orange-700",
  danger: "bg-red-100 text-red-700",
  gold: "bg-yellow-100 text-yellow-800",
  gray: "bg-gray-100 text-gray-500",
};

const sizeStyles: Record<"sm" | "md", string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-xs",
};

export default function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        font-semibold rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

export function StatutBadge({ statut }: { statut: StatutInscription }) {
  const config: Record<
    StatutInscription,
    { label: string; variant: BadgeVariant }
  > = {
    EN_ATTENTE: { label: "En attente", variant: "warning" },
    VALIDE: { label: "Validé", variant: "success" },
    REFUSE: { label: "Refusé", variant: "danger" },
  };

  const { label, variant } = config[statut];

  return <Badge variant={variant}>{label}</Badge>;
}