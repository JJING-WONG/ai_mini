import { useId } from 'react'
import Field from './Field.jsx'

export default function SelectField({
  id, label, hint, error, required = false, children, className = '', 'aria-describedby': describedBy, ...props
}) {
  const generatedId = useId()
  const inputId = id || generatedId
  const description = [describedBy, (hint || error) && `${inputId}-message`].filter(Boolean).join(' ') || undefined

  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required}>
      <select
        {...props}
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={description}
        className={`h-12 min-w-0 w-full rounded-input border bg-surface px-4 text-body text-ink disabled:cursor-not-allowed disabled:bg-line ${error ? 'border-danger' : 'border-line'} ${className}`}
      >
        {children}
      </select>
    </Field>
  )
}
