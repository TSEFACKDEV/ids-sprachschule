interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "red" | "white" | "black" | "gold";
  className?: string;
}

const sizeMap = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-4",
};

const colorMap = {
  red: "border-ids-red border-t-transparent",
  white: "border-white border-t-transparent",
  black: "border-ids-black border-t-transparent",
  gold: "border-ids-gold border-t-transparent",
};

export default function Spinner({
  size = "md",
  color = "red",
  className = "",
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Chargement"
      className={`
        inline-block rounded-full animate-spin
        ${sizeMap[size]}
        ${colorMap[color]}
        ${className}
      `}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" color="red" />
        <p className="text-sm text-gray-500 font-medium">Chargement...</p>
      </div>
    </div>
  );
}