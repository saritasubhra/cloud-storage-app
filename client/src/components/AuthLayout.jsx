import Logo from "./Logo.jsx";

function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-sm border border-moss-light bg-white/40 px-8 py-10">
          <h1 className="text-2xl font-medium text-ink">{title}</h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p>
          )}

          <div className="mt-8">{children}</div>
        </div>

        {footer && (
          <p className="mt-6 text-center text-sm text-ink-soft">{footer}</p>
        )}
      </div>
    </div>
  );
}

export default AuthLayout;
