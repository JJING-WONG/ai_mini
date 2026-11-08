import { addCalendarDays, calendarDaysBetween, getLocalToday, isCalendarDate } from '../utils/date.js'

export function getLastManagedDate(itemId, histories) {
  return histories.reduce((latest, record) => record.itemId === itemId && isCalendarDate(record.managedAt)
    && (latest === null || record.managedAt > latest) ? record.managedAt : latest, null)
}

export function calculateMaintenance(item, histories, today = getLocalToday()) {
  if (!isCalendarDate(today)) throw new RangeError('오늘 날짜가 올바르지 않습니다.')
  const lastManagedDate = getLastManagedDate(item.id, histories)
  const base = { lastManagedDate, nextDueDate: null, daysUntilDue: null, status: 'unset', scheduleError: null }
  if (!lastManagedDate || !Number.isSafeInteger(item.intervalDays) || item.intervalDays <= 0) return base
  let nextDueDate
  try { nextDueDate = addCalendarDays(lastManagedDate, item.intervalDays) } catch {
    return { ...base, scheduleError: '지원하는 날짜 범위를 벗어났어요. 관리 주기를 줄여 주세요.' }
  }
  const daysUntilDue = calendarDaysBetween(today, nextDueDate)
  const status = daysUntilDue < 0 ? 'overdue' : daysUntilDue === 0 ? 'today' : daysUntilDue <= 7 ? 'upcoming' : 'scheduled'
  return { lastManagedDate, nextDueDate, daysUntilDue, status, scheduleError: null }
}

const priorities = { overdue: 0, today: 1, upcoming: 2, scheduled: 3, unset: 4 }
export function sortByMaintenancePriority(items) {
  return [...items].sort((a, b) => priorities[a.status] - priorities[b.status]
    || (a.nextDueDate || '').localeCompare(b.nextDueDate || '') || a.id.localeCompare(b.id))
}
