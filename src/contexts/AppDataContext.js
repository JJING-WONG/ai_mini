import { createContext, useContext } from 'react'
export const AppDataContext = createContext(null)
export function useAppData() {
  const context = useContext(AppDataContext)
  if (!context) throw new Error('AppDataProvider 안에서 사용해야 합니다.')
  return context
}
