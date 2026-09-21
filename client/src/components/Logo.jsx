import { PackageOpen } from "lucide-react";

function Logo({ size = 24 }) {
  return (
    <div className="flex items-center gap-2">
      <PackageOpen className="text-moss" size={size} strokeWidth={1.75} />
      <span className="font-display text-xl font-medium text-ink">Depot</span>
    </div>
  );
}

export default Logo;
