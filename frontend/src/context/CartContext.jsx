import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const CART_KEY = 'rv-sena-cart'
const MAX_QTY = 20

const CartContext = createContext(null)

const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) ?? []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart)
  const [isOpen, setIsOpen] = useState(false)
  const [bump, setBump] = useState(0) // dispara la animación del ícono del carrito

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const add = useCallback((product, quantity = 1, notes = '') => {
    setItems((current) => {
      const existing = current.find((i) => i.id === product.id)
      if (existing) {
        return current.map((i) =>
          i.id === product.id
            ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + quantity), notes: notes || i.notes }
            : i,
        )
      }
      const { id, name, slug, price, image_url, prep_minutes } = product
      return [...current, { id, name, slug, price, image_url, prep_minutes, quantity, notes }]
    })
    setBump((b) => b + 1)
  }, [])

  const setQuantity = useCallback((id, quantity) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((i) => i.id !== id)
        : current.map((i) => (i.id === id ? { ...i, quantity: Math.min(MAX_QTY, quantity) } : i)),
    )
  }, [])

  const setNotes = useCallback((id, notes) => {
    setItems((current) => current.map((i) => (i.id === id ? { ...i, notes } : i)))
  }, [])

  const remove = useCallback((id) => setItems((current) => current.filter((i) => i.id !== id)), [])
  const clear = useCallback(() => setItems([]), [])

  const value = useMemo(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0)
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const quantityOf = (id) => items.find((i) => i.id === id)?.quantity ?? 0
    return {
      items,
      count,
      subtotal,
      quantityOf,
      add,
      setQuantity,
      setNotes,
      remove,
      clear,
      isOpen,
      bump,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      maxQty: MAX_QTY,
    }
  }, [items, isOpen, bump, add, setQuantity, setNotes, remove, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
