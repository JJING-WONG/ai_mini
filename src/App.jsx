import AppDataProvider from './contexts/AppDataProvider.jsx'
import AppRouter from './app/AppRouter.jsx'

export default function App() {
  return <AppDataProvider><AppRouter /></AppDataProvider>
}
