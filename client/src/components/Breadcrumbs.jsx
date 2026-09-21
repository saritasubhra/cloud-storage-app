function Breadcrumbs({ path, onNavigate }) {
  return (
    <nav aria-label="Folder path" className="flex flex-wrap items-center gap-1.5 text-sm">
      {path.map((crumb, index) => {
        const isCurrent = index === path.length - 1;

        return (
          <span key={crumb.id ?? "root"} className="flex items-center gap-1.5">
            {index > 0 && <span className="text-ink-soft/60">/</span>}
            {isCurrent ? (
              <span className="font-medium text-ink">{crumb.name}</span>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate(index)}
                className="text-ink-soft hover:text-ochre-dark hover:underline"
              >
                {crumb.name}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default Breadcrumbs;
