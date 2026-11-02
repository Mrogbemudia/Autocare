import { Link, useLocation, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api.js'
import { useMe } from '../lib/auth.js'
import { formatPhone, mapsLink } from '../lib/format.js'
import { serviceLabel } from '../lib/constants.js'
import { EmptyState, ErrorState, PageSpinner, VerifiedBadge } from '../components/ui.jsx'

export default function ShopDetail() {
  const { shopId } = useParams()
  const location = useLocation()
  const { data: user } = useMe()
  const { data: shop, isPending, error, refetch } = useQuery({
    queryKey: ['shop', shopId],
    queryFn: () => api.shops.get(shopId),
  })

  if (isPending) return <PageSpinner />
  if (error?.status === 404) {
    return (
      <div className="px-4 py-16">
        <EmptyState title="This shop is not available" action={<Link to="/shops" className="btn btn-primary">Browse shops</Link>}>
          It may have been removed or is not verified.
        </EmptyState>
      </div>
    )
  }
  if (error) return <ErrorState error={error} onRetry={refetch} />

  // Guests are prompted to log in and return here afterwards (US-01).
  const cta =
    user?.role === 'owner' ? (
      <Link to={`/requests/new?shop=${shop.id}`} className="btn btn-primary">Request a quote</Link>
    ) : !user ? (
      <Link to="/login" state={{ from: location }} className="btn btn-primary">Log in to request a quote</Link>
    ) : null

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_320px]">
      <article>
        <Link to="/shops" className="text-sm font-semibold underline underline-offset-4">Back to shops</Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl sm:text-4xl">{shop.business_name}</h1>
          <VerifiedBadge />
        </div>
        <p className="mt-1 text-lg text-ink-soft">{shop.city_area}, {shop.state}</p>

        {shop.description && <p className="mt-6 max-w-prose whitespace-pre-line">{shop.description}</p>}

        <h2 className="mt-8 text-xl">Services</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {shop.services?.map((s) => (
            <li key={s.code ?? s} className="rounded-full bg-white px-3 py-1 text-sm font-semibold ring-1 ring-line">{serviceLabel(s)}</li>
          ))}
        </ul>
      </article>

      <aside className="card h-fit space-y-5 p-5">
        {cta}
        <div>
          <h2 className="text-base">Address</h2>
          <p className="mt-1">{shop.address}</p>
          <a className="mt-1 inline-block text-sm font-semibold underline underline-offset-4" target="_blank" rel="noreferrer" href={mapsLink(shop.address, shop.city_area, shop.state)}>
            Open in Google Maps
          </a>
        </div>
        {shop.opening_hours && (
          <div>
            <h2 className="text-base">Opening hours</h2>
            <p className="mt-1 whitespace-pre-line">{shop.opening_hours}</p>
          </div>
        )}
        <div>
          <h2 className="text-base">Phone</h2>
          {shop.phone ? (
            <a className="mt-1 inline-block font-semibold underline underline-offset-4" href={`tel:${shop.phone}`}>{formatPhone(shop.phone)}</a>
          ) : (
            <p className="mt-1 text-ink-soft">
              <Link to="/login" state={{ from: location }} className="font-semibold underline underline-offset-4">Log in</Link> to see the phone number.
            </p>
          )}
        </div>
        <p className="text-sm text-ink-soft">
          {shop.avg_rating ? `Rated ${Number(shop.avg_rating).toFixed(1)} out of 5` : 'No reviews yet'}
        </p>
      </aside>
    </div>
  )
}
