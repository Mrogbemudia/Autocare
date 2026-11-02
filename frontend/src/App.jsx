import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import { GuestOnly, RequireAuth } from './components/RouteGuards.jsx'

// Each page is its own chunk, so first load stays small on mobile data.
const Home = lazy(() => import('./pages/Home.jsx'))
const Shops = lazy(() => import('./pages/Shops.jsx'))
const ShopDetail = lazy(() => import('./pages/ShopDetail.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Register = lazy(() => import('./pages/Register.jsx'))
const Garage = lazy(() => import('./pages/Garage.jsx'))
const RequestNew = lazy(() => import('./pages/RequestNew.jsx'))
const Requests = lazy(() => import('./pages/Requests.jsx'))
const ShopDashboard = lazy(() => import('./pages/ShopDashboard.jsx'))
const AdminShops = lazy(() => import('./pages/AdminShops.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="shops" element={<Shops />} />
        <Route path="shops/:shopId" element={<ShopDetail />} />

        <Route element={<GuestOnly />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        <Route element={<RequireAuth roles={['owner']} />}>
          <Route path="garage" element={<Garage />} />
          <Route path="requests" element={<Requests />} />
          <Route path="requests/new" element={<RequestNew />} />
        </Route>

        <Route element={<RequireAuth roles={['shop']} />}>
          <Route path="shop" element={<ShopDashboard />} />
        </Route>

        <Route element={<RequireAuth roles={['admin']} />}>
          <Route path="admin/shops" element={<AdminShops />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
