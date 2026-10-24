import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import AdminLayout from './components/layout/AdminLayout'
import StoreLayout from './components/layout/StoreLayout'
import { PageLoader } from './components/ui/Feedback'
import Home from './pages/Home'
import Login from './pages/Login'
import Menu from './pages/Menu'
import NotFound from './pages/NotFound'
import ProductDetail from './pages/ProductDetail'
import Register from './pages/Register'
import { GuestOnly, RequireAuth } from './routes/guards'

// Las pantallas con sesión se cargan bajo demanda para que la tienda abra más rápido.
const Checkout = lazy(() => import('./pages/Checkout'))
const MyOrders = lazy(() => import('./pages/MyOrders'))
const OrderTracking = lazy(() => import('./pages/OrderTracking'))
const Favorites = lazy(() => import('./pages/Favorites'))
const Profile = lazy(() => import('./pages/Profile'))
const KitchenBoard = lazy(() => import('./pages/kitchen/KitchenBoard'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminProducts = lazy(() => import('./pages/admin/Products'))
const AdminCategories = lazy(() => import('./pages/admin/Categories'))
const AdminCoupons = lazy(() => import('./pages/admin/Coupons'))
const AdminOrders = lazy(() => import('./pages/admin/Orders'))
const AdminUsers = lazy(() => import('./pages/admin/Users'))

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<GuestOnly />}>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
        </Route>

        <Route element={<StoreLayout />}>
          <Route index element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/menu/:slug" element={<ProductDetail />} />

          <Route element={<RequireAuth />}>
            <Route path="/perfil" element={<Profile />} />
            <Route path="/pedidos/:code" element={<OrderTracking />} />
          </Route>

          <Route element={<RequireAuth roles={['cliente', 'admin']} />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/pedidos" element={<MyOrders />} />
            <Route path="/favoritos" element={<Favorites />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>

        <Route element={<RequireAuth roles={['cocina', 'admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/cocina" element={<KitchenBoard />} />
          </Route>
        </Route>

        <Route element={<RequireAuth roles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/productos" element={<AdminProducts />} />
            <Route path="/admin/categorias" element={<AdminCategories />} />
            <Route path="/admin/cupones" element={<AdminCoupons />} />
            <Route path="/admin/pedidos" element={<AdminOrders />} />
            <Route path="/admin/usuarios" element={<AdminUsers />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}
