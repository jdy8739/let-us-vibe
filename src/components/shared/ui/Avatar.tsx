/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";

export type AvatarProps = {
  src?: string | null;
  alt?: string;
  initials?: string;
  size?: number; // pixels
  ring?: boolean;
  className?: string;
};

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "",
  initials,
  size = 128,
  ring = true,
  className,
}) => {
  const dimension = size;
  const ringClasses = ring ? "ring-1 ring-gray-300" : "";

  if (src) {
    return (
      <div
        className={[
          "relative overflow-hidden rounded-full",
          ringClasses,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ width: dimension, height: dimension }}
      >
        <img
          src={src}
          alt={alt}
          width={dimension}
          height={dimension}
          className="object-cover"
        />
      </div>
    );
  }

  const fallback = (initials?.trim() || "U").slice(0, 2).toUpperCase();

  return (
    <div
      className={[
        "flex items-center justify-center rounded-full bg-gray-200 text-gray-800 font-bold",
        ringClasses,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width: dimension, height: dimension }}
      aria-label={alt}
    >
      <span style={{ fontSize: Math.max(12, Math.floor(dimension / 3)) }}>
        {fallback}
      </span>
    </div>
  );
};

export default Avatar;
