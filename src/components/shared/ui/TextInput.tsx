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
    <div className="form-row">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={["input", className].filter(Boolean).join(" ")}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
