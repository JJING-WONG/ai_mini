import { describe, expect, test } from 'vitest'
import { execFileSync } from 'node:child_process'
import process from 'node:process'
import { addCalendarDays, calendarDaysBetween, getLocalToday, isCalendarDate } from '../src/utils/date.js'
import { calculateMaintenance, getLastManagedDate, sortByMaintenancePriority } from '../src/services/maintenanceService.js'
import { createItemViews } from '../src/contexts/useDataViews.js'

const item = { id: 'item-1', intervalDays: 14 }
const record = (managedAt, extra = {}) => ({ itemId: item.id, managedAt, ...extra })

describe('달력 날짜', () => {
  test.each([
    ['2024-02-28', 1, '2024-02-29'], ['2024-02-29', 1, '2024-03-01'],
    ['2025-02-28', 1, '2025-03-01'], ['1900-02-28', 1, '1900-03-01'],
    ['2000-02-28', 1, '2000-02-29'], ['2026-04-30', 1, '2026-05-01'],
    ['2026-12-31', 1, '2027-01-01'], ['2026-01-01', -1, '2025-12-31'],
    ['0001-01-01', 0, '0001-01-01'], ['9999-12-30', 1, '9999-12-31'],
    ['2026-10-26', 14, '2026-11-09'],
  ])('%s + %i일 = %s', (date, days, expected) => expect(addCalendarDays(date, days)).toBe(expected))
  test.each(['2026-02-29', '1900-02-29', '2026-04-31', '2026-00-01', '2026-1-01', '0000-01-01', null, 'junk'])('잘못된 날짜 %s를 거부한다', date => {
    expect(isCalendarDate(date)).toBe(false)
    expect(() => addCalendarDays(date, 1)).toThrow(RangeError)
  })
  test('범위 초과와 정수가 아닌 일수는 거부한다', () => {
    for (const [date, days] of [['9999-12-31', 1], ['0001-01-01', -1], ['2026-01-01', 0.5], ['2026-01-01', Number.MAX_SAFE_INTEGER]]) {
      expect(() => addCalendarDays(date, days)).toThrow(RangeError)
    }
  })
  test('일수 차이는 시각·서머타임과 무관한 달력 날짜 차이이다', () => {
    expect(calendarDaysBetween('2026-03-07', '2026-03-09')).toBe(2)
    expect(calendarDaysBetween('2026-10-31', '2026-11-02')).toBe(2)
    expect(calendarDaysBetween('2024-02-28', '2024-03-01')).toBe(2)
    expect(calendarDaysBetween('2026-11-09', '2026-11-08')).toBe(-1)
  })
  test('오늘 날짜는 Date의 로컬 달력 값을 사용한다', () => {
    expect(getLocalToday(new Date(2026, 10, 8, 0, 1))).toBe('2026-11-08')
  })
  test.each(['UTC', 'Asia/Seoul', 'America/Los_Angeles', 'Pacific/Apia'])('%s에서도 같은 날짜 계산 결과를 반환한다', timezone => {
    const dateModule = new URL('../src/utils/date.js', import.meta.url).href
    const script = `import {addCalendarDays,calendarDaysBetween,isCalendarDate} from ${JSON.stringify(dateModule)}; console.log(JSON.stringify([addCalendarDays('2026-03-07',2),addCalendarDays('2026-10-31',2),calendarDaysBetween('2011-12-29','2011-12-31'),isCalendarDate('2011-12-30')]))`
    const result = execFileSync(process.execPath, ['--input-type=module', '-e', script], { env: { ...process.env, TZ: timezone }, encoding: 'utf8' })
    expect(JSON.parse(result)).toEqual(['2026-03-09', '2026-11-02', 2, true])
  })
})

describe('마지막 관리일·다음 관리일·상태', () => {
  test('기록 순서와 유형에 무관하게 해당 항목의 최신 관리일을 사용한다', () => {
    const histories = [record('2026-10-01', { type: 'completed' }), record('2099-01-01', { itemId: 'other' }), record('2026-10-26', { type: 'initial' }), record('2026-10-15'), record('broken')]
    const original = JSON.stringify(histories)
    expect(getLastManagedDate(item.id, histories)).toBe('2026-10-26')
    expect(calculateMaintenance(item, histories, '2026-11-08')).toMatchObject({ lastManagedDate: '2026-10-26', nextDueDate: '2026-11-09', daysUntilDue: 1, status: 'upcoming' })
    expect(JSON.stringify(histories)).toBe(original)
  })
  test.each([[-2, 'overdue'], [-1, 'overdue'], [0, 'today'], [1, 'upcoming'], [7, 'upcoming'], [8, 'scheduled'], [30, 'scheduled']])('다음 관리일까지 %i일이면 %s', (daysUntilDue, status) => {
    const next = addCalendarDays('2026-11-08', daysUntilDue)
    const result = calculateMaintenance({ ...item, intervalDays: 1 }, [record(addCalendarDays(next, -1))], '2026-11-08')
    expect(result).toMatchObject({ nextDueDate: next, daysUntilDue, status })
  })
  test('주기 또는 기록이 없으면 미설정이다', () => {
    expect(calculateMaintenance(item, [], '2026-11-08')).toMatchObject({ lastManagedDate: null, nextDueDate: null, status: 'unset' })
    for (const intervalDays of [null, 0, -1, 1.5, undefined]) {
      expect(calculateMaintenance({ ...item, intervalDays }, [record('2026-10-26')], '2026-11-08')).toMatchObject({ lastManagedDate: '2026-10-26', nextDueDate: null, status: 'unset' })
    }
  })
  test('표현 범위 밖의 큰 주기는 화면을 중단하지 않고 안내한다', () => {
    expect(calculateMaintenance({ ...item, intervalDays: Number.MAX_SAFE_INTEGER }, [record('2026-10-26')], '2026-11-08')).toMatchObject({ status: 'unset', nextDueDate: null, scheduleError: expect.any(String) })
  })
  test('주기 변경과 최신 기록 수정·삭제에 따라 다시 계산한다', () => {
    const histories = [record('2026-10-26'), record('2026-10-12')]
    expect(calculateMaintenance({ ...item, intervalDays: 30 }, histories, '2026-11-08').nextDueDate).toBe('2026-11-25')
    expect(calculateMaintenance(item, histories.slice(1), '2026-11-08').nextDueDate).toBe('2026-10-26')
    expect(calculateMaintenance(item, [record('2026-11-01'), histories[1]], '2026-11-08').nextDueDate).toBe('2026-11-15')
    expect(calculateMaintenance(item, [], '2026-11-08').status).toBe('unset')
  })
  test('오래된 기록을 추가하거나 같은 날짜 기록이 있어도 최신 관리일은 유지한다', () => {
    expect(calculateMaintenance(item, [record('2026-10-26'), record('2026-10-26'), record('2026-10-01')], '2026-11-08').nextDueDate).toBe('2026-11-09')
  })
  test('오늘이 바뀌면 예정→임박→오늘→지연으로 바뀐다', () => {
    const histories = [record('2026-10-26')]
    expect(['2026-11-01', '2026-11-02', '2026-11-09', '2026-11-10'].map(today => calculateMaintenance(item, histories, today).status)).toEqual(['scheduled', 'upcoming', 'today', 'overdue'])
  })
  test('잘못된 오늘 날짜는 명시적으로 거부한다', () => {
    expect(() => calculateMaintenance(item, [], 'invalid')).toThrow(RangeError)
  })
})

describe('정렬과 화면 데이터', () => {
  test('상태 우선순위와 같은 상태의 빠른 날짜 순으로 정렬하며 원본을 유지한다', () => {
    const items = [
      { id: 'unset', status: 'unset', nextDueDate: null },
      { id: 'scheduled', status: 'scheduled', nextDueDate: '2026-11-20' },
      { id: 'late2', status: 'overdue', nextDueDate: '2026-11-07' },
      { id: 'upcoming', status: 'upcoming', nextDueDate: '2026-11-09' },
      { id: 'today', status: 'today', nextDueDate: '2026-11-08' },
      { id: 'late1', status: 'overdue', nextDueDate: '2026-11-01' },
    ]
    const original = items.map(item => item.id)
    expect(sortByMaintenancePriority(items).map(item => item.id)).toEqual(['late1', 'late2', 'today', 'upcoming', 'scheduled', 'unset'])
    expect(items.map(item => item.id)).toEqual(original)
  })
  test('공유 화면 값은 원본 데이터에서 도출하고 저장 모델에 중복 저장하지 않는다', () => {
    const data = { spaces: [{ id: 'custom', name: '베란다' }], items: [{ ...item, spaceId: 'custom' }], histories: [record('2026-10-26', { id: 'history-1' })] }
    const original = JSON.stringify(data)
    const [view] = createItemViews(data, '2026-11-08')
    expect(view).toMatchObject({ spaceName: '베란다', nextManagedLabel: '2026년 11월 9일', status: 'upcoming', statusDetail: '1일 남음' })
    expect(JSON.stringify(data)).toBe(original)
    expect(Object.hasOwn(data.items[0], 'nextDueDate')).toBe(false)
  })
})
