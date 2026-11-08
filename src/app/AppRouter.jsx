import { lazy, Suspense } from 'react'
import OnboardingAccess from './OnboardingAccess.jsx'
import AppLayout from '../components/layout/AppLayout.jsx'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import OnboardingPage from '../pages/OnboardingPage.jsx'
import HomePage from '../pages/HomePage.jsx'
import ItemsPage from '../pages/ItemsPage.jsx'
import ItemDetailPage from '../pages/ItemDetailPage.jsx'
import ItemDetailLayout from '../features/items/components/ItemDetailLayout.jsx'
import ItemFormPage from '../pages/ItemFormPage.jsx'
import ItemFormLayout from '../features/items/components/ItemFormLayout.jsx'
import RecordPage from '../pages/RecordPage.jsx'
import RecordFormLayout from '../features/histories/components/RecordFormLayout.jsx'
import HistoryPage from '../pages/HistoryPage.jsx'
import HistoryEditPage from '../pages/HistoryEditPage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'

const UiPreviewPage = import.meta.env.DEV
  ? lazy(() => import('../dev/UiPreviewPage.jsx'))
  : null

const LayoutPreviewPage = import.meta.env.DEV
  ? lazy(() => import('../dev/LayoutPreviewPage.jsx'))
  : null

function LegacyOnboardingRedirect() {
  const { search, hash } = useLocation()
  return <Navigate to={{ pathname: '/', search, hash }} replace />
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {import.meta.env.DEV && (
          <Route path="/dev/ui" element={
            <Suspense fallback={<p className="p-5 text-muted">불러오는 중…</p>}>
              <UiPreviewPage />
            </Suspense>
          } />
        )}
        {import.meta.env.DEV && (
          <Route path="/dev/layout" element={
            <Suspense fallback={<p className="p-5 text-muted">불러오는 중…</p>}>
              <LayoutPreviewPage />
            </Suspense>
          } />
        )}
        <Route path="/" element={<OnboardingAccess><OnboardingPage /></OnboardingAccess>} />
        <Route path="/onboarding" element={<LegacyOnboardingRedirect />} />
        <Route element={<OnboardingAccess />}>
          <Route element={<AppLayout bottomNavigation />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/items" element={<ItemsPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>
          <Route element={<ItemFormLayout />}>
            <Route path="/items/new" element={<ItemFormPage />} />
          </Route>
          <Route element={<ItemDetailLayout />}>
            <Route path="/items/:itemId" element={<ItemDetailPage />} />
          </Route>
          <Route element={<ItemFormLayout />}>
            <Route path="/items/:itemId/edit" element={<ItemFormPage />} />
          </Route>
          <Route element={<RecordFormLayout />}>
            <Route path="/items/:itemId/record" element={<RecordPage />} />
          </Route>
          <Route element={<RecordFormLayout editing />}>
            <Route path="/history/:historyId/edit" element={<HistoryEditPage />} />
          </Route>
        </Route>
        <Route element={<AppLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
