import { useId } from 'react'
import Field from './Field.jsx'

export default function TextField({
  id, label, hint, error, required = false, suffix, className = '', 'aria-describedby': describedBy, ...props
}) {
  const generatedId = useId()
  const inputId = id || generatedId
  const description = [describedBy, (hint || error) && `${inputId}-message`, suffix && `${inputId}-unit`].filter(Boolean).join(' ') || undefined

  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required}>
      <div className="relative">
        <input
          {...props}
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={description}
          className={`h-12 min-w-0 w-full rounded-input border bg-surface pl-4 text-body text-ink placeholder:text-muted disabled:cursor-not-allowed disabled:bg-line ${suffix ? 'pr-10' : 'pr-4'} ${error ? 'border-danger' : 'border-line'} ${className}`}
        />
        {suffix && <span id={`${inputId}-unit`} className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-caption text-subtle">{suffix}</span>}
      </div>
    </Field>
  )
}
