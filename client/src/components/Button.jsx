import { Loader2 } from "lucide-react";

function Button({ children, loading = false, variant = "primary", className = "", ...props }) {
  const base =
    "flex w-full items-center justify-center gap-2 rounded-sm px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";

  const variants = {
    primary: "bg-ochre text-paper hover:bg-ochre-dark",
    outline: "border border-moss-light text-ink hover:bg-paper-alt",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={16} />}
      {children}
    </button>
  );
}

export default Button;
