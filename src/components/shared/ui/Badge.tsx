"use client";

import React from "react";

export type BadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "blue" | "green" | "red";
  size?: "sm" | "md";
  className?: string;
};

const toneToClass: Record<string, string> = {
  neutral: "bg-gray-100 text-gray-800",
  blue: "bg-blue-100 text-blue-800",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
};

const sizeToClass: Record<string, string> = {
  sm: "px-2.5 py-0.5 text-[11px]",
  md: "px-3 py-1 text-xs",
};

const Badge: React.FC<BadgeProps> = ({
  children,
  tone = "neutral",
  size = "sm",
  className,
}) => {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full font-medium",
        toneToClass[tone],
        sizeToClass[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
};

export default Badge;
