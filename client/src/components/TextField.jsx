function TextField({ label, error, id, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        className={`mt-1.5 w-full border-b bg-transparent py-1.5 text-ink outline-none transition-colors placeholder:text-ink-soft/50 ${
          error ? "border-rust" : "border-moss-light focus:border-ochre"
        }`}
        {...inputProps}
      />
      {error && <p className="mt-1.5 text-sm text-rust">{error}</p>}
    </div>
  );
}

export default TextField;
