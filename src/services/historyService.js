import { getLocalToday, isCalendarDate } from '../utils/date.js'
import { validateResource } from '../repositories/dataValidation.js'
import { calculateMaintenance } from './maintenanceService.js'

export function validateHistoryInput(values, today = getLocalToday()) {
  const errors = {}
  if (!isCalendarDate(values.managedAt) || values.managedAt > today) errors.managedAt = '오늘 또는 과거의 올바른 관리 날짜를 입력해 주세요.'
  for (const field of ['productUsed', 'memo']) if (typeof values[field] !== 'string') errors[field] = '문자로 입력해 주세요.'
  return errors
}

function fields(values, today) {
  if (Object.keys(validateHistoryInput(values, today)).length) throw new Error('관리 날짜와 입력 내용을 확인해 주세요.')
  return { managedAt: values.managedAt, productUsed: values.productUsed, memo: values.memo }
}
function requireItem(data, itemId) {
  if (!data.items.some(item => item.id === itemId)) throw new Error('기록할 관리 대상을 찾을 수 없어요.')
}
function withHistories(data, histories) {
  if (!validateResource('histories', histories)) throw new Error('관리 기록 형식을 확인해 주세요.')
  return { ...data, histories }
}

export function addHistoryData(data, itemId, values, { id = () => crypto.randomUUID(), now = () => new Date().toISOString(), today = getLocalToday() } = {}) {
  requireItem(data, itemId)
  const record = { id: `history-${id()}`, itemId, ...fields(values, today), type: 'completed', createdAt: now() }
  return { data: withHistories(data, [...data.histories, record]), historyId: record.id, itemId }
}

export function updateHistoryData(data, historyId, values, { today = getLocalToday() } = {}) {
  const original = data.histories.find(record => record.id === historyId)
  if (!original) throw new Error('수정할 관리 기록을 찾을 수 없어요.')
  requireItem(data, original.itemId)
  const updated = { ...original, ...fields(values, today) }
  return { data: withHistories(data, data.histories.map(record => record.id === historyId ? updated : record)), historyId, itemId: original.itemId }
}

export function deleteHistoryData(data, historyId) {
  const original = data.histories.find(record => record.id === historyId)
  if (!original) throw new Error('삭제할 관리 기록을 찾을 수 없어요.')
  requireItem(data, original.itemId)
  return { data: withHistories(data, data.histories.filter(record => record.id !== historyId)), historyId, itemId: original.itemId }
}

// 저장하지 않고 입력한 기록을 반영한 일정만 보여줍니다. 기존 기록의 날짜 수정도 지원합니다.
export function previewHistorySchedule(item, histories, managedAt, { historyId, today = getLocalToday() } = {}) {
  if (!isCalendarDate(managedAt) || managedAt > today) return null
  const remaining = histories.filter(record => !historyId || record.id !== historyId)
  return calculateMaintenance(item, [...remaining, { itemId: item.id, managedAt }], today)
}
