const cop = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

/** 24900 → "$ 24.900" */
export const formatCOP = (value) => cop.format(value ?? 0)

const dateTime = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
})

const time = new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit' })

export const formatDateTime = (iso) => (iso ? dateTime.format(new Date(iso)) : '')
export const formatTime = (iso) => (iso ? time.format(new Date(iso)) : '')

const weekday = new Intl.DateTimeFormat('es-CO', { weekday: 'short' })
/** "2026-10-23" → "jue" (sin desfase de zona horaria) */
export const formatWeekday = (ymd) => {
  const [y, m, d] = ymd.split('-').map(Number)
  return weekday.format(new Date(y, m - 1, d)).replace('.', '')
}

/** Minutos transcurridos desde una fecha ISO. */
export const minutesSince = (iso, now = Date.now()) =>
  Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000))

export const timeAgo = (iso) => {
  const min = minutesSince(iso)
  if (min < 1) return 'justo ahora'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  return formatDateTime(iso)
}

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
