const monthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const daysBeforeMonth = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
const leapYear = year => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
const daysBeforeYear = year => {
  const previous = year - 1
  return previous * 365 + Math.floor(previous / 4) - Math.floor(previous / 100) + Math.floor(previous / 400)
}

export function isCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  return year >= 1 && month >= 1 && month <= 12 && day >= 1
    && day <= monthLengths[month - 1] + (month === 2 && leapYear(year) ? 1 : 0)
}

// 시각·UTC 변환 없이 달력의 연·월·일을 연속된 정수 일수로 계산합니다.
function calendarDay(value) {
  if (!isCalendarDate(value)) throw new RangeError('올바른 YYYY-MM-DD 날짜가 필요합니다.')
  const [year, month, day] = value.split('-').map(Number)
  return daysBeforeYear(year) + daysBeforeMonth[month - 1] + (month > 2 && leapYear(year) ? 1 : 0) + day - 1
}

export function addCalendarDays(value, days) {
  const start = calendarDay(value)
  if (!Number.isSafeInteger(days) || !Number.isSafeInteger(start + days)) throw new RangeError('정수 일수가 필요합니다.')
  const target = start + days
  if (target < 0 || target >= daysBeforeYear(10000)) throw new RangeError('지원하는 날짜 범위를 벗어났습니다.')
  let low = 1
  let high = 9999
  while (low < high) {
    const middle = Math.ceil((low + high) / 2)
    if (daysBeforeYear(middle) <= target) low = middle
    else high = middle - 1
  }
  const year = low
  let remainder = target - daysBeforeYear(year)
  let month = 1
  while (true) {
    const length = monthLengths[month - 1] + (month === 2 && leapYear(year) ? 1 : 0)
    if (remainder < length) break
    remainder -= length
    month++
  }
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(remainder + 1).padStart(2, '0')}`
}

export function calendarDaysBetween(start, end) { return calendarDay(end) - calendarDay(start) }

export function getLocalToday(date = new Date()) {
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
