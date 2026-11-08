import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppData } from '../contexts/AppDataContext.js'
import { onboardingDestination } from './routingPolicy.js'

export default function OnboardingAccess({ children }) {
  const { onboarding, isLoading } = useAppData()
  const { pathname, search } = useLocation()
  if (isLoading) return <p role="status" className="p-5 text-body text-muted">초기 설정을 확인하고 있어요…</p>
  const destination = onboardingDestination({ pathname, search, completed: onboarding.completed, development: import.meta.env.DEV })
  return destination ? <Navigate to={destination} replace /> : children || <Outlet />
}
