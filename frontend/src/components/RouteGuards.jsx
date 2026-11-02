import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { homeFor, useMe } from '../lib/auth.js'
import { ErrorState, PageSpinner } from './ui.jsx'

// Protected pages. Guests go to /login and come back here afterwards (US-01).
// This is UX only: the server enforces roles and ownership (IDOR).
export function RequireAuth({ roles }) {
  const { data: user, isPending, error, refetch } = useMe()
  const location = useLocation()
  if (isPending) return <PageSpinner />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />
  return <Outlet />
}

// Login and register pages. A signed-in user is sent back to where they came from.
export function GuestOnly() {
  const { data: user, isPending } = useMe()
  const from = useLocation().state?.from
  if (isPending) return <PageSpinner />
  if (user) return <Navigate to={from ? `${from.pathname}${from.search ?? ''}` : homeFor(user.role)} replace />
  return <Outlet />
}
