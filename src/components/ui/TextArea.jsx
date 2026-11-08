import { useId } from 'react'
import Field from './Field.jsx'

export default function TextArea({
  id, label, hint, error, required = false, className = '', 'aria-describedby': describedBy, ...props
}) {
  const generatedId = useId()
  const inputId = id || generatedId
  const description = [describedBy, (hint || error) && `${inputId}-message`].filter(Boolean).join(' ') || undefined

  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required}>
      <textarea
        rows={4}
        {...props}
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={description}
        className={`min-h-24 min-w-0 w-full resize-y rounded-input border bg-surface px-4 py-3 text-body text-ink placeholder:text-muted disabled:cursor-not-allowed disabled:bg-line ${error ? 'border-danger' : 'border-line'} ${className}`}
      />
    </Field>
  )
}
