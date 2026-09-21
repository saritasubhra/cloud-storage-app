import { PackageOpen } from "lucide-react";

// Placeholder screen for Step 1 - just confirms the build pipeline
// (Tailwind theme, fonts, routing, toasts) is wired up correctly.
// Step 2 replaces this with real routes (login, register, dashboard).
function App() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-moss-light text-moss">
          <PackageOpen size={28} strokeWidth={1.75} />
        </div>
        <h1 className="text-4xl font-medium tracking-tight text-ink">
          Depot
        </h1>
        <p className="mt-3 text-ink-soft leading-relaxed">
          Your files, organized. The frontend scaffold is running - routing,
          Tailwind theme, and fonts are wired up. Auth screens come next.
        </p>
        <div className="mt-8 h-px bg-moss-light" />
        <p className="mt-6 text-sm text-ink-soft">
          Backend expected at{" "}
          <code className="rounded bg-paper-alt px-1.5 py-0.5 text-ink">
            {import.meta.env.VITE_API_BASE_URL || "not set"}
          </code>
        </p>
      </div>
    </div>
  );
}

export default App;
