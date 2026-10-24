import { LoaderCircle } from 'lucide-react'
import { Link } from 'react-router'

const variants = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm shadow-brand-500/30',
  accent: 'bg-accent-500 text-white hover:bg-accent-600 shadow-sm shadow-accent-500/30',
  secondary: 'bg-white text-ink border border-line hover:border-slate-300 hover:bg-slate-50',
  ghost: 'text-ink hover:bg-slate-100',
  danger: 'bg-red-50 text-red-600 hover:bg-red-100',
  dark: 'bg-ink text-white hover:bg-slate-800',
}

const sizes = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-[15px] gap-2',
  lg: 'h-13 px-7 text-base gap-2.5',
  icon: 'h-10 w-10',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  to,
  children,
  disabled,
  ...props
}) {
  const classes = `inline-flex shrink-0 items-center justify-center rounded-xl font-semibold transition duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}
