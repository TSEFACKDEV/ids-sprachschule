"use client";

import Image from "next/image";
import { useState } from "react";

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fallbackBg?: string;
  fallbackText?: string;
}

export default function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  priority,
  fallbackBg = "#0A0A0A",
  fallbackText,
}: SafeImageProps) {
  const [errored, setErrored] = useState(false);

  if (errored) {
    return (
      <div
        className={`flex items-center justify-center ${className ?? ""}`}
        style={{
          backgroundColor: fallbackBg,
          width: fill ? "100%" : width,
          height: fill ? "100%" : height,
          position: fill ? "absolute" : "relative",
          inset: fill ? 0 : undefined,
        }}
      >
        <span
          style={{
            color: "#D4AF37",
            fontFamily: "serif",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          {fallbackText ?? "IDS"}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={className}
      priority={priority}
      onError={() => setErrored(true)}
    />
  );
}