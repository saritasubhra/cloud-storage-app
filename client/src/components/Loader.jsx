import { Loader2 } from "lucide-react";

function Loader({ fullScreen = false, label = "Loading…" }) {
  const content = (
    <div className="flex flex-col items-center gap-3 text-ink-soft">
      <Loader2 className="animate-spin text-moss" size={28} strokeWidth={2} />
      <span className="text-sm">{label}</span>
    </div>
  );

  if (!fullScreen) return content;

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      {content}
    </div>
  );
}

export default Loader;
