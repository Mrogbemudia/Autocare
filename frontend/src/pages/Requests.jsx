import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api.js'
import { urgencyLabel } from '../lib/constants.js'
import { formatDateTime } from '../lib/format.js'
import { EmptyState, ErrorState, PageSpinner, StatusBadge } from '../components/ui.jsx'

// Slice 1: a list only. Quote review, booking and job tracking attach to each row next.
export default function Requests() {
  const { data: requests, isPending, error, refetch } = useQuery({ queryKey: ['requests'], queryFn: api.requests.list })

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl">My requests</h1>
      <div className="mt-6">
        {isPending ? <PageSpinner /> : error ? <ErrorState error={error} onRetry={refetch} /> : requests.length === 0 ? (
          <EmptyState title="No requests yet" action={<Link to="/shops" className="btn btn-primary">Find a shop</Link>}>
            Pick a shop and send your first request to get an itemised quote.
          </EmptyState>
        ) : (
          <ul className="space-y-3">
            {requests.map((r) => (
              <li key={r.id} className="card flex flex-wrap items-start justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold">{r.vehicle?.year} {r.vehicle?.make} {r.vehicle?.model}</p>
                  <p className="text-sm text-ink-soft">To {r.shop?.business_name}, {urgencyLabel(r.urgency)}, sent {formatDateTime(r.created_at)}</p>
                </div>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
