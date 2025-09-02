"use client";

import React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  leftIcon?: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  className,
  leftIcon,
  children,
  ...props
}) => {
  const base =
    variant === "secondary"
      ? "inline-flex items-center justify-center px-4 py-2 rounded-xl border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
      : "inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl";
  const classes = [base, className].filter(Boolean).join(" ");
  return (
    <button className={classes} {...props}>
      {leftIcon}
      {children}
    </button>
  );
};
