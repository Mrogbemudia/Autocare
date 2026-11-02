import { cloneElement, useEffect, useId, useState } from 'react'

export function Spinner({ label = 'Loading' }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-ink-soft">
      <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
      {label}…
    </span>
  )
}

// After 5 seconds, explain the delay (free-tier backends sleep when idle).
export function PageSpinner() {
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 5000)
    return () => clearTimeout(timer)
  }, [])
  return (
    <div className="grid place-items-center gap-2 py-24 text-center">
      <Spinner />
      {slow && <p className="max-w-xs text-sm text-ink-soft">Still working. The server may be waking up, which can take up to a minute.</p>}
    </div>
  )
}

export function ErrorState({ error, onRetry }) {
  return (
    <div role="alert" className="card mx-auto max-w-lg p-6 text-center">
      <h2 className="text-xl">Something went wrong</h2>
      <p className="mt-2 text-ink-soft">{error?.message ?? 'Please try again.'}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-primary mt-4">
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="card mx-auto max-w-lg p-8 text-center">
      <h2 className="text-xl">{title}</h2>
      {children && <p className="mt-2 text-ink-soft">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function FormError({ children }) {
  if (!children) return null
  return (
    <p role="alert" className="rounded-md border border-alert/40 bg-alert/10 px-3 py-2 text-sm text-alert">
      {children}
    </p>
  )
}

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-verified/10 px-2 py-0.5 text-sm font-semibold text-verified">
      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 8.5 3.2 3L13 4.5" />
      </svg>
      Verified
    </span>
  )
}

const GOOD = new Set(['verified', 'completed', 'approved', 'accepted', 'confirmed', 'paid'])
const BAD = new Set(['rejected', 'suspended', 'cancelled', 'declined'])

export function StatusBadge({ status }) {
  const tone = GOOD.has(status) ? 'bg-verified/10 text-verified' : BAD.has(status) ? 'bg-alert/10 text-alert' : 'bg-danfo/25 text-ink'
  const label = String(status).replace(/_/g, ' ')
  return <span className={`inline-block rounded-full px-2 py-0.5 text-sm font-semibold capitalize ${tone}`}>{label}</span>
}

// Wraps ONE input, select or textarea. Adds the id, label link, error text and aria wiring.
export function Field({ label, hint, error, children }) {
  const id = useId()
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
      </label>
      {cloneElement(children, {
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
        className: `input ${children.props.className ?? ''}`,
      })}
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-alert">
          {error}
        </p>
      )}
    </div>
  )
}

export function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null
  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-4">
      <button type="button" className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      <span className="text-sm text-ink-soft">
        Page {page} of {totalPages}
      </span>
      <button type="button" className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </nav>
  )
}
