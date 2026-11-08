import { useEffect, useState } from 'react'
import { getLocalToday } from '../utils/date.js'

export default function useCalendarToday() {
  const [today, setToday] = useState(getLocalToday)
  useEffect(() => {
    let midnightTimer
    function refresh() {
      setToday(getLocalToday())
      window.clearTimeout(midnightTimer)
      const now = new Date()
      const midnight = new Date(now)
      midnight.setHours(24, 0, 0, 0)
      midnightTimer = window.setTimeout(refresh, Math.max(1, midnight - now))
    }
    const initial = new Date()
    const midnight = new Date(initial)
    midnight.setHours(24, 0, 0, 0)
    midnightTimer = window.setTimeout(refresh, Math.max(1, midnight - initial))
    const clockCheck = window.setInterval(refresh, 60_000)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearTimeout(midnightTimer)
      window.clearInterval(clockCheck)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])
  return today
}
