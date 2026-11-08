export default function BottomActionBar({ children }) {
  return (
    <footer className="shrink-0 border-t border-divider bg-canvas/95 px-5 pt-[13px] pb-[calc(16px+env(safe-area-inset-bottom))] backdrop-blur-sm">
      <div className="flex min-w-0 items-center gap-3 [&_button]:min-h-14 [&_button]:text-base">
        {children}
      </div>
    </footer>
  )
}
