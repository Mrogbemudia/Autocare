import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api } from '../lib/api.js'
import { NIGERIAN_STATES, SERVICE_TYPES, serviceLabel } from '../lib/constants.js'
import { useDebounce } from '../hooks/useDebounce.js'
import { EmptyState, ErrorState, PageSpinner, Pagination, VerifiedBadge } from '../components/ui.jsx'

const PAGE_SIZE = 12

function ShopCard({ shop }) {
  return (
    <li>
      <Link to={`/shops/${shop.id}`} className="card block h-full p-5 hover:border-ink/50">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl">{shop.business_name}</h2>
          <VerifiedBadge />
        </div>
        <p className="mt-1 text-ink-soft">{shop.city_area}, {shop.state}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Services">
          {shop.services?.map((s) => (
            <li key={s.code ?? s} className="rounded-full bg-road px-2.5 py-0.5 text-sm">{serviceLabel(s)}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm font-semibold">
          {shop.avg_rating ? `${Number(shop.avg_rating).toFixed(1)} out of 5` : 'No reviews yet'}
        </p>
      </Link>
    </li>
  )
}

export default function Shops() {
  const [params, setParams] = useSearchParams()
  const state = params.get('state') ?? ''
  const city = params.get('city') ?? ''
  const service = params.get('service') ?? ''
  const sort = params.get('sort') ?? 'rating' // allowlist is enforced on the server
  const page = Number(params.get('page')) || 1

  // Filters live in the URL, so a filtered search can be shared and Back works.
  const update = (changes) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      for (const [key, value] of Object.entries(changes)) value ? next.set(key, value) : next.delete(key)
      if (!('page' in changes)) next.delete('page')
      return next
    })

  const [cityInput, setCityInput] = useState(city)
  const debouncedCity = useDebounce(cityInput.trim(), 400)
  useEffect(() => {
    setParams(
      (prev) => {
        if ((prev.get('city') ?? '') === debouncedCity) return prev
        const next = new URLSearchParams(prev)
        if (debouncedCity) next.set('city', debouncedCity)
        else next.delete('city')
        next.delete('page')
        return next
      },
      { replace: true },
    )
  }, [debouncedCity, setParams])

  const query = useQuery({
    queryKey: ['shops', { state, city, service, sort, page }],
    queryFn: () => api.shops.list({ state, city, service, sort, page, pageSize: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  })
  const shops = query.data?.data ?? []
  const meta = query.data?.meta

  const clear = () => {
    setCityInput('')
    setParams({})
  }
  const hasFilters = state || city || service

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl">Find a verified shop</h1>
      <p className="mt-1 text-ink-soft">Every shop listed here has been checked by Kaza.</p>

      <form onSubmit={(e) => e.preventDefault()} className="card mt-6 grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Filter shops">
        <label className="space-y-1.5 text-sm font-semibold">
          State
          <select className="input font-normal" value={state} onChange={(e) => update({ state: e.target.value })}>
            <option value="">All states</option>
            {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="space-y-1.5 text-sm font-semibold">
          City or area
          <input className="input font-normal" value={cityInput} onChange={(e) => setCityInput(e.target.value)} placeholder="For example, Ikeja" />
        </label>
        <label className="space-y-1.5 text-sm font-semibold">
          Service
          <select className="input font-normal" value={service} onChange={(e) => update({ service: e.target.value })}>
            <option value="">Any service</option>
            {SERVICE_TYPES.map((s) => <option key={s.code} value={s.code}>{s.label}</option>)}
          </select>
        </label>
        <label className="space-y-1.5 text-sm font-semibold">
          Sort by
          <select className="input font-normal" value={sort} onChange={(e) => update({ sort: e.target.value })}>
            <option value="rating">Top rated</option>
            <option value="newest">Newest</option>
          </select>
        </label>
      </form>

      <div className="mt-6" aria-live="polite">
        {query.isPending ? (
          <PageSpinner />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={query.refetch} />
        ) : shops.length === 0 ? (
          <EmptyState
            title="No shops match these filters"
            action={hasFilters && <button type="button" onClick={clear} className="btn btn-secondary">Clear filters</button>}
          >
            Try another city or area, or search a whole state.
          </EmptyState>
        ) : (
          <>
            <ul className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${query.isPlaceholderData ? 'opacity-60' : ''}`}>
              {shops.map((shop) => <ShopCard key={shop.id} shop={shop} />)}
            </ul>
            <Pagination page={page} totalPages={meta?.totalPages} onChange={(p) => update({ page: p > 1 ? p : '' })} />
          </>
        )}
      </div>
    </div>
  )
}
