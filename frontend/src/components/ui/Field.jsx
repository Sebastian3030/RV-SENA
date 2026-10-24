import { useId } from 'react'

function Wrapper({ label, error, hint, id, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-sm font-medium text-red-600">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-sm text-muted">{hint}</p>
      )}
    </div>
  )
}

export function Input({ label, error, hint, icon: Icon, className, ...props }) {
  const id = useId()
  return (
    <Wrapper label={label} error={error} hint={hint} id={id} className={className}>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-muted" />}
        <input
          id={id}
          className={`field ${Icon ? 'pl-10' : ''} ${error ? 'field-error' : ''}`}
          aria-invalid={Boolean(error)}
          {...props}
        />
      </div>
    </Wrapper>
  )
}

export function Textarea({ label, error, hint, className, ...props }) {
  const id = useId()
  return (
    <Wrapper label={label} error={error} hint={hint} id={id} className={className}>
      <textarea id={id} rows={3} className={`field resize-none ${error ? 'field-error' : ''}`} {...props} />
    </Wrapper>
  )
}

export function Select({ label, error, hint, className, children, ...props }) {
  const id = useId()
  return (
    <Wrapper label={label} error={error} hint={hint} id={id} className={className}>
      <select id={id} className={`field appearance-none bg-[length:16px] bg-[right_14px_center] bg-no-repeat pr-10 ${error ? 'field-error' : ''}`}
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }}
        {...props}
      >
        {children}
      </select>
    </Wrapper>
  )
}

export function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {description && <span className="block text-sm text-muted">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-brand-500' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </label>
  )
}
