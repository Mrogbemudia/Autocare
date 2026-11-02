import { useMe } from '../lib/auth.js'
import { serviceLabel } from '../lib/constants.js'
import { StatusBadge } from '../components/ui.jsx'

const MESSAGES = {
  pending: 'Your shop is awaiting verification. An admin will review your details. Until then, owners cannot see your shop.',
  verified: 'Your shop is verified and visible to owners. Incoming requests will appear here.',
  rejected: 'Your shop was not approved.',
  suspended: 'Your shop is suspended and hidden from owners.',
}

// Slice 1: verification status (US-03). The request inbox and quoting come next.
export default function ShopDashboard() {
  const { data: user } = useMe()
  const shop = user?.shop
  if (!shop) return <p className="px-4 py-16 text-center text-ink-soft">No shop profile is linked to this account.</p>

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl">{shop.business_name}</h1>
      <section className="card mt-6 p-5" aria-labelledby="status-heading">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="status-heading" className="text-xl">Verification status</h2>
          <StatusBadge status={shop.verification_status} />
        </div>
        <p className="mt-2 max-w-prose">{MESSAGES[shop.verification_status]}</p>
        {shop.verification_note && (
          <p className="mt-3 rounded-md bg-road p-3 text-sm"><strong>Note from the admin:</strong> {shop.verification_note}</p>
        )}
      </section>
      {shop.services?.length > 0 && (
        <p className="mt-6 text-ink-soft">Services: {shop.services.map(serviceLabel).join(', ')}</p>
      )}
    </div>
  )
}
