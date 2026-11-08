import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import PageHeader from './PageHeader.jsx'
import BottomNavigation from './BottomNavigation.jsx'
import BottomActionBar from './BottomActionBar.jsx'

export default function AppLayout({ title, description, backTo, headerAction, bottomNavigation = false, bottomAction, scrollKey, children }) {
  const { pathname } = useLocation()
  const contentRef = useRef(null)

  useEffect(() => {
    contentRef.current?.scrollTo(0, 0)
  }, [pathname, scrollKey])

  return (
    <div className="mx-auto flex h-dvh min-h-0 w-full max-w-[375px] flex-col overflow-hidden bg-canvas">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-10 focus:rounded-input focus:bg-surface focus:p-3">본문으로 건너뛰기</a>
      {title && <PageHeader title={title} description={description} backTo={backTo} action={headerAction} />}
      <main id="main-content" ref={contentRef} tabIndex={-1} className={`min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-6 ${title ? '' : 'pt-[calc(24px+env(safe-area-inset-top))]'}`}>
        {children ?? <Outlet />}
      </main>
      {bottomAction ? <BottomActionBar>{bottomAction}</BottomActionBar> : bottomNavigation ? <BottomNavigation /> : null}
    </div>
  )
}
