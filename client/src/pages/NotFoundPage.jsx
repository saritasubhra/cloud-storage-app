import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <h1 className="font-display text-6xl text-ink">404</h1>
      <p className="mt-3 text-ink-soft">
        This page doesn't exist, or you don't have access to it.
      </p>
      <Link
        to="/"
        className="mt-6 text-sm font-medium text-ochre-dark hover:underline"
      >
        Back to Depot
      </Link>
    </div>
  );
}

export default NotFoundPage;
