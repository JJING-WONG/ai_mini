import { describe, expect, test } from 'vitest'
import { addHistoryData, updateHistoryData, deleteHistoryData, previewHistorySchedule, validateHistoryInput } from '../src/services/historyService.js'
import { addStoredHistory, updateStoredHistory, deleteStoredHistory, emptyAppData, loadAppData } from '../src/contexts/appDataStore.js'
import { calculateMaintenance } from '../src/services/maintenanceService.js'
import { createHistoryGroups, createItemViews } from '../src/contexts/useDataViews.js'

const createdAt = '2026-11-08T00:00:00.000Z'
const item = { id: 'item-1', templateId: null, spaceId: 'kitchen', name: '배수구', intervalDays: 14, modelName: '', specification: '', image: null, memo: '', createdAt }
const values = { managedAt: '2026-11-08', productUsed: '중성세제', memo: '건조했어요' }
const options = { id: () => 'test', now: () => createdAt, today: '2026-11-08' }
function initialData() {
  return { ...emptyAppData, spaces: [{ id: 'kitchen', name: '주방' }], items: [item, { ...item, id: 'item-other' }], histories: [
    { id: 'initial-1', itemId: item.id, managedAt: '2026-10-26', type: 'initial', productUsed: '', memo: '기존 기록', createdAt },
    { id: 'other-1', itemId: 'item-other', managedAt: '2026-10-20', type: 'completed', productUsed: '', memo: '다른 항목', createdAt },
  ], onboarding: { ...emptyAppData.onboarding, completed: true } }
}
function withStorage(run) {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const stored = new Map()
  const storage = { getItem: key => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, String(value)), removeItem: key => stored.delete(key) }
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage })
  try {
    const data = initialData()
    for (const key of ['spaces', 'items', 'histories', 'onboarding']) storage.setItem(`homeguide:${key}`, JSON.stringify(data[key]))
    return run(data, storage, stored)
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original)
    else delete globalThis.localStorage
  }
}

describe('관리 기록', () => {
  test('새 기록은 completed이며 항목·기존 기록을 보존한다', () => {
    const data = initialData()
    const before = JSON.stringify(data)
    const result = addHistoryData(data, item.id, values, options)
    expect(result.historyId).toBe('history-test')
    expect(result.data.histories.at(-1)).toEqual({ id: 'history-test', itemId: item.id, ...values, type: 'completed', createdAt })
    expect(result.data.items).toEqual(data.items)
    expect(JSON.stringify(data)).toBe(before)
    expect(calculateMaintenance(item, result.data.histories, options.today).nextDueDate).toBe('2026-11-22')
  })
  test('같은 날짜에 명시적으로 추가한 여러 기록은 별도 ID로 유지한다', () => {
    const first = addHistoryData(initialData(), item.id, values, options)
    const second = addHistoryData(first.data, item.id, values, { ...options, id: () => 'second' })
    expect(second.data.histories.filter(record => record.managedAt === values.managedAt)).toHaveLength(2)
    expect(() => addHistoryData(first.data, item.id, values, options)).toThrow()
    expect(calculateMaintenance(item, second.data.histories, options.today).nextDueDate).toBe('2026-11-22')
  })
  test('과거 기록 추가로 최신 관리일을 뒤로 바꾸지 않는다', () => {
    const result = addHistoryData(initialData(), item.id, { ...values, managedAt: '2026-10-01' }, options)
    expect(calculateMaintenance(item, result.data.histories, options.today)).toMatchObject({ lastManagedDate: '2026-10-26', nextDueDate: '2026-11-09' })
  })
  test('주기 없는 항목도 기록을 저장하고 상태는 미설정으로 유지한다', () => {
    const data = initialData(); data.items[0] = { ...item, intervalDays: null }
    const result = addHistoryData(data, item.id, values, options)
    expect(calculateMaintenance(data.items[0], result.data.histories, options.today)).toMatchObject({ lastManagedDate: values.managedAt, nextDueDate: null, status: 'unset' })
  })
  test.each(['', '2099-01-01', '2026-02-29', '2026-04-31', '2026-1-01'])('잘못된 날짜 %s는 추가·수정 모두 막는다', managedAt => {
    expect(validateHistoryInput({ ...values, managedAt }, options.today).managedAt).toBeTruthy()
    expect(() => addHistoryData(initialData(), item.id, { ...values, managedAt }, options)).toThrow()
    expect(() => updateHistoryData(initialData(), 'initial-1', { ...values, managedAt }, options)).toThrow()
  })
  test('잘못된 선택 입력 타입과 없는 항목·기록을 거부한다', () => {
    expect(validateHistoryInput({ ...values, productUsed: null, memo: {} }, options.today)).toHaveProperty('productUsed')
    expect(() => addHistoryData(initialData(), 'missing', values, options)).toThrow()
    expect(() => updateHistoryData(initialData(), 'missing', values, options)).toThrow()
    expect(() => deleteHistoryData(initialData(), 'missing')).toThrow()
  })
  test('초기 기록 수정은 ID·생성일·유형·항목 연결을 유지한다', () => {
    const data = initialData()
    const result = updateHistoryData(data, 'initial-1', values, options)
    expect(result.data.histories[0]).toEqual({ ...data.histories[0], ...values })
    expect(result.data.histories[1]).toEqual(data.histories[1])
    expect(data.histories[0].memo).toBe('기존 기록')
  })
  test('제품·메모만 바꾸면 일정은 유지된다', () => {
    const data = initialData()
    const result = updateHistoryData(data, 'initial-1', { ...values, managedAt: data.histories[0].managedAt }, options)
    expect(calculateMaintenance(item, result.data.histories, options.today)).toEqual(calculateMaintenance(item, data.histories, options.today))
  })
  test('최신 날짜를 과거로 수정하면 남은 더 최근 기록을 기준으로 계산한다', () => {
    const added = addHistoryData(initialData(), item.id, values, options)
    const result = updateHistoryData(added.data, added.historyId, { ...values, managedAt: '2026-10-01' }, options)
    expect(calculateMaintenance(item, result.data.histories, options.today).lastManagedDate).toBe('2026-10-26')
  })
  test('최신 기록 삭제와 모든 기록 삭제 시 일정을 재계산하며 다른 항목 기록은 보존한다', () => {
    const added = addHistoryData(initialData(), item.id, values, options)
    const first = deleteHistoryData(added.data, added.historyId)
    expect(calculateMaintenance(item, first.data.histories, options.today).nextDueDate).toBe('2026-11-09')
    const second = deleteHistoryData(first.data, 'initial-1')
    expect(calculateMaintenance(item, second.data.histories, options.today)).toMatchObject({ lastManagedDate: null, nextDueDate: null, status: 'unset' })
    expect(second.data.histories.map(record => record.id)).toEqual(['other-1'])
    expect(added.data.histories).toHaveLength(3)
  })
})

describe('저장 전 예상 일정과 목록', () => {
  test('작성·수정 예상 일정은 저장하지 않고 날짜 변경 결과만 보여준다', () => {
    const data = initialData()
    const before = JSON.stringify(data)
    expect(previewHistorySchedule(item, data.histories, '2026-11-08', { today: options.today }).nextDueDate).toBe('2026-11-22')
    expect(previewHistorySchedule(item, data.histories, '2026-10-01', { today: options.today }).nextDueDate).toBe('2026-11-09')
    expect(previewHistorySchedule(item, data.histories, '2026-10-01', { historyId: 'initial-1', today: options.today }).nextDueDate).toBe('2026-10-15')
    expect(previewHistorySchedule(item, data.histories, '', { today: options.today })).toBeNull()
    expect(previewHistorySchedule(item, data.histories, '2099-01-01', { today: options.today })).toBeNull()
    expect(JSON.stringify(data)).toBe(before)
  })
  test('전체 기록과 항목별 기록은 managedAt 최신순이며 동일 날짜 기록을 모두 표시한다', () => {
    const first = addHistoryData(initialData(), item.id, values, options)
    const second = addHistoryData(first.data, item.id, values, { ...options, id: () => 'second' })
    const views = createItemViews(second.data, options.today)
    const groups = createHistoryGroups(views)
    expect(groups.count).toBe(4)
    expect(groups.groups.map(group => group.date)).toEqual(['2026-11-08', '2026-10-26', '2026-10-20'])
    expect(groups.groups[0].entries).toHaveLength(2)
    expect(views.find(view => view.id === item.id).histories.every(record => record.itemId === item.id)).toBe(true)
  })
})

describe('저장과 다시 불러오기', () => {
  test('추가·수정·삭제 후 재조회해 기록과 일정이 유지된다', () => withStorage(data => {
    const added = addStoredHistory(data, item.id, values, options)
    let loaded = loadAppData()
    expect(loaded.histories.at(-1).memo).toBe(values.memo)
    expect(calculateMaintenance(item, loaded.histories, options.today).nextDueDate).toBe('2026-11-22')
    const updated = updateStoredHistory(loaded, added.historyId, { ...values, managedAt: '2026-11-01' }, options)
    loaded = loadAppData()
    expect(loaded.histories.at(-1).managedAt).toBe('2026-11-01')
    expect(calculateMaintenance(item, loaded.histories, options.today).nextDueDate).toBe('2026-11-15')
    deleteStoredHistory(updated.data, added.historyId)
    expect(loadAppData()).toEqual(data)
  }))
  test.each(['add', 'update', 'delete'])('%s 저장 실패 시 기존 원본과 일정이 변하지 않는다', operation => withStorage((data, storage, stored) => {
    const before = new Map(stored)
    storage.setItem = () => { throw new Error('QuotaExceededError') }
    const actions = { add: () => addStoredHistory(data, item.id, values, options), update: () => updateStoredHistory(data, 'initial-1', values, options), delete: () => deleteStoredHistory(data, 'initial-1') }
    expect(actions[operation]).toThrow()
    expect(stored).toEqual(before)
    expect(loadAppData()).toEqual(data)
    expect(calculateMaintenance(item, data.histories, options.today).nextDueDate).toBe('2026-11-09')
  }))
})
