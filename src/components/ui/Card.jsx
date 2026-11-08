export default function Card({ children, className = '', ...props }) {
  return (
    <div {...props} className={`flex min-w-0 flex-col gap-2 rounded-card border border-line bg-surface px-[18px] py-4 ${className}`}>
      {children}
    </div>
  )
}
