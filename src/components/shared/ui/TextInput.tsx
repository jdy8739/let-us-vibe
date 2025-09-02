"use client";

import React, { useId } from "react";

export type TextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  className,
  id,
  ...props
}) => {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-gray-900"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          "w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50",
          "focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500",
          error
            ? "border-red-300 focus:ring-red-100 focus:border-red-500 bg-white"
            : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
