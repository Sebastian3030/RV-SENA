import {
  Armchair, Banknote, Beef, Bike, CakeSlice, Coffee, CookingPot, CreditCard, CupSoda,
  Drumstick, Fish, IceCreamCone, Pizza, Salad, Sandwich, Smartphone, Soup, Store, Utensils,
} from 'lucide-react'

/** Íconos permitidos para categorías (el backend guarda el nombre). */
export const CATEGORY_ICONS = {
  beef: Beef,
  pizza: Pizza,
  soup: Soup,
  fish: Fish,
  salad: Salad,
  drumstick: Drumstick,
  'cake-slice': CakeSlice,
  'cup-soda': CupSoda,
  coffee: Coffee,
  'ice-cream-cone': IceCreamCone,
  sandwich: Sandwich,
  'cooking-pot': CookingPot,
  utensils: Utensils,
}

export const categoryIcon = (name) => CATEGORY_ICONS[name] ?? Utensils

export const ORDER_STATUS = {
  pendiente: { label: 'Pendiente', tone: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' },
  en_preparacion: { label: 'En preparación', tone: 'bg-sky-50 text-sky-700 ring-sky-200', dot: 'bg-sky-500' },
  listo: { label: 'Listo', tone: 'bg-brand-50 text-brand-700 ring-brand-200', dot: 'bg-brand-500' },
  entregado: { label: 'Entregado', tone: 'bg-slate-100 text-slate-700 ring-slate-200', dot: 'bg-slate-500' },
  cancelado: { label: 'Cancelado', tone: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-red-500' },
}

export const ORDER_TYPES = [
  { value: 'mesa', label: 'En mesa', hint: 'Te lo llevamos a tu mesa', icon: Armchair },
  { value: 'recoger', label: 'Para recoger', hint: 'Pasas por él al mostrador', icon: Store },
  { value: 'domicilio', label: 'A domicilio', hint: '+ $ 4.000 de envío', icon: Bike },
]

export const PAYMENT_METHODS = [
  { value: 'efectivo', label: 'Efectivo', icon: Banknote },
  { value: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
  { value: 'nequi', label: 'Nequi', icon: Smartphone },
]

export const DELIVERY_FEE = 4000

export const ROLES = {
  cliente: 'Cliente',
  cocina: 'Cocina',
  admin: 'Administrador',
}

export const SORT_OPTIONS = [
  { value: 'popular', label: 'Más pedidos' },
  { value: 'rating', label: 'Mejor calificados' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'newest', label: 'Más nuevos' },
]
