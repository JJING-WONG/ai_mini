const variants = {
  primary: 'border-line bg-primary text-white enabled:hover:brightness-95',
  secondary: 'border-line bg-surface text-ink enabled:hover:bg-canvas',
  danger: 'border-line bg-surface text-danger enabled:hover:bg-canvas',
  text: 'border-transparent bg-transparent text-primary enabled:hover:underline',
}

export default function Button({
  children, variant = 'primary', type = 'button', className = '', disabled = false, ...props
}) {
  const geometry = variant === 'text'
    ? 'justify-start rounded-none p-0'
    : 'min-h-[52px] justify-center rounded-card px-[18px] py-2.5'

  return (
    <button
      {...props}
      type={type}
      disabled={disabled}
      className={`inline-flex w-full items-center gap-2 border text-label font-bold whitespace-normal transition-colors disabled:cursor-not-allowed disabled:border-line disabled:bg-line disabled:text-ink ${geometry} ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  )
}
