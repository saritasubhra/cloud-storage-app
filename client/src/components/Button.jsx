import { Loader2 } from "lucide-react";

function Button({
  as = "button",
  children,
  loading = false,
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "flex w-full items-center justify-center gap-2 rounded-sm px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";

  const variants = {
    primary: "bg-ochre text-paper hover:bg-ochre-dark",
    outline: "border border-moss-light text-ink hover:bg-paper-alt",
    danger: "bg-rust text-paper hover:bg-rust/90",
  };

  const Component = as;
  // disabled/loading only make sense for a real <button>, not an <a>
  const disabledProps =
    as === "button" ? { disabled: loading || props.disabled } : {};

  return (
    <Component
      className={`${base} ${variants[variant]} ${className}`}
      {...disabledProps}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={16} />}
      {children}
    </Component>
  );
}

export default Button;
