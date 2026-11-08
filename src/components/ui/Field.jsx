export default function Field({ id, label, required, hint, error, children }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="text-label font-bold">
        {label}{required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {(error || hint) && (
        <p id={`${id}-message`} role={error ? 'alert' : undefined} className={`text-caption ${error ? 'text-danger' : 'text-muted'}`}>
          {error || hint}
        </p>
      )}
    </div>
  )
}
