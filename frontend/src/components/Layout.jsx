import { Suspense, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useLogout, useMe } from '../lib/auth.js'
import { PageSpinner } from './ui.jsx'

const NAV = {
  owner: [
    ['/shops', 'Find a shop'],
    ['/garage', 'My garage'],
    ['/requests', 'My requests'],
  ],
  shop: [['/shop', 'My shop']],
  admin: [
    ['/admin/shops', 'Verify shops'],
    ['/shops', 'Browse shops'],
  ],
}
const GUEST_NAV = [['/shops', 'Find a shop']]

const linkClass = ({ isActive }) =>
  `rounded px-2 py-2 font-semibold underline-offset-[6px] decoration-[3px] ${isActive ? 'underline' : 'hover:underline'}`

export default function Layout() {
  const { data: user, isPending } = useMe()
  const logout = useLogout()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const links = user ? NAV[user.role] ?? GUEST_NAV : GUEST_NAV
  const close = () => setOpen(false)

  return (
    <div className="flex min-h-svh flex-col">
      <a href="#main" className="sr-only rounded bg-white px-3 py-2 font-semibold focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50">
        Skip to content
      </a>

      {/* The danfo band: the one loud thing on the page. */}
      <header className="border-b-[6px] border-ink bg-danfo">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between px-4 py-3">
          <Link to="/" onClick={close} className="font-display text-3xl font-extrabold tracking-tight">
            Kaza
          </Link>
          <button
            type="button"
            className="btn btn-secondary btn-sm md:hidden"
            aria-expanded={open}
            aria-controls="site-nav"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? 'Close' : 'Menu'}
          </button>
          <nav
            id="site-nav"
            aria-label="Main"
            className={`${open ? 'flex' : 'hidden'} w-full flex-col gap-1 pt-2 md:flex md:w-auto md:flex-row md:items-center md:gap-3 md:pt-0`}
          >
            {links.map(([to, label]) => (
              <NavLink key={to} to={to} onClick={close} className={linkClass}>
                {label}
              </NavLink>
            ))}
            {!isPending &&
              (user ? (
                <div className="flex items-center gap-3 md:ml-2">
                  <span className="font-semibold">{user.full_name?.split(' ')[0]}</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={logout.isPending}
                    onClick={() => logout.mutate(undefined, { onSettled: () => { close(); navigate('/') } })}
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 md:ml-2">
                  <Link to="/login" onClick={close} className="font-semibold underline-offset-[6px] hover:underline">
                    Log in
                  </Link>
                  <Link to="/register" onClick={close} className="btn btn-primary btn-sm">
                    Sign up
                  </Link>
                </div>
              ))}
          </nav>
        </div>
      </header>

      <main id="main" className="flex-1">
        <Suspense fallback={<PageSpinner />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="border-t border-line bg-white">
        <p className="mx-auto max-w-6xl px-4 py-5 text-sm text-ink-soft">
          Kaza connects vehicle owners with repair shops across Nigeria. Payment happens directly with the shop.
        </p>
      </footer>
    </div>
  )
}
