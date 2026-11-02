import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api.js'
import { serviceLabel } from '../lib/constants.js'
import { formatDateTime, formatPhone } from '../lib/format.js'
import { EmptyState, ErrorState, FormError, PageSpinner } from '../components/ui.jsx'

const TABS = [
  ['pending', 'Pending'],
  ['verified', 'Verified'],
  ['rejected', 'Rejected'],
  ['suspended', 'Suspended'],
]

function ReviewCard({ shop }) {
  const qc = useQueryClient()
  const [mode, setMode] = useState(null) // 'rejected' | 'suspended' | null
  const [note, setNote] = useState('')
  const review = useMutation({
    mutationFn: (body) => api.admin.reviewShop(shop.id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-shops'] }),
  })
  const status = shop.verification_status
  const approve = () => review.mutate({ status: 'verified' })
  const confirm = () => review.mutate({ status: mode, note: note.trim() })

  return (
    <li className="card p-5">
      <h2 className="text-xl">{shop.business_name}</h2>
      <p className="text-ink-soft">{shop.city_area}, {shop.state}. {shop.address}</p>
      {shop.owner && (
        <p className="mt-2 text-sm">{shop.owner.full_name}, {shop.owner.email}, {formatPhone(shop.owner.phone)}</p>
      )}
      <p className="mt-2 text-sm text-ink-soft">Services: {shop.services?.map(serviceLabel).join(', ') || 'none listed'}. Registered {formatDateTime(shop.created_at)}.</p>
      <div className="mt-3 rounded-md bg-road p-3 text-sm">
        <p className="font-semibold">Certification notes</p>
        <p className="mt-1 whitespace-pre-line">{shop.certification_notes || 'None provided.'}</p>
      </div>
      {shop.verification_note && <p className="mt-3 text-sm"><strong>Last note:</strong> {shop.verification_note}</p>}

      <FormError>{review.error?.message}</FormError>

      {mode ? (
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-semibold">
            Reason (shown to the shop)
            <textarea rows={3} className="input mt-1.5 font-normal" value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <div className="flex gap-2">
            <button type="button" className="btn btn-danger btn-sm" disabled={note.trim().length < 5 || review.isPending} onClick={confirm}>
              {mode === 'rejected' ? 'Reject shop' : 'Suspend shop'}
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setMode(null); setNote('') }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {status !== 'verified' && (
            <button type="button" className="btn btn-primary btn-sm" disabled={review.isPending} onClick={approve}>
              {status === 'suspended' ? 'Reinstate' : 'Approve'}
            </button>
          )}
          {status === 'pending' && <button type="button" className="btn btn-secondary btn-sm" onClick={() => setMode('rejected')}>Reject</button>}
          {status === 'verified' && <button type="button" className="btn btn-secondary btn-sm" onClick={() => setMode('suspended')}>Suspend</button>}
        </div>
      )}
    </li>
  )
}

export default function AdminShops() {
  const [status, setStatus] = useState('pending')
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['admin-shops', status],
    queryFn: () => api.admin.shops({ status }),
  })
  const shops = data?.data ?? []

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl">Verify shops</h1>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {TABS.map(([value, label]) => (
          <button key={value} type="button" aria-pressed={status === value} onClick={() => setStatus(value)} className={`btn btn-sm ${status === value ? 'btn-primary' : 'btn-secondary'}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="mt-6" aria-live="polite">
        {isPending ? <PageSpinner /> : error ? <ErrorState error={error} onRetry={refetch} /> : shops.length === 0 ? (
          <EmptyState title={`No ${status} shops`} />
        ) : (
          <ul className="space-y-4">{shops.map((s) => <ReviewCard key={s.id} shop={s} />)}</ul>
        )}
      </div>
    </div>
  )
}
