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
  const base = variant === "secondary" ? "btn-secondary" : "btn";
  const classes = [base, className].filter(Boolean).join(" ");
  return (
    <button className={classes} {...props}>
      {leftIcon}
      {children}
    </button>
  );
};
