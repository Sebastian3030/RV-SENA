import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import CartDrawer from './CartDrawer'
import Footer from './Footer'
import Navbar from './Navbar'

export default function StoreLayout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
