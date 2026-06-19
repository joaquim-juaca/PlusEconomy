import React from "react";

export default function Logo({ size = 36, className = "" }) {
  return (
    <img
      src="/logo-icon.png"
      alt="PlusEconomy"
      width={size}
      height={size}
      className={`shrink-0 rounded-[22%] object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
