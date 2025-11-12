import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

export const Button: React.FC<ButtonProps> = ({
  variant = "default",
  className = "",
  children,
  ...props
}) => {
  const base =
    "px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50";
  const styles =
    variant === "outline"
      ? "border border-sky-400 text-sky-600 bg-white hover:bg-sky-50"
      : "bg-sky-500 text-white hover:bg-sky-600";

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
};
