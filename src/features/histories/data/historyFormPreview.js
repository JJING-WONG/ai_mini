import { itemsPreviewScenarios } from '../../items/data/itemsPreview.js'
import { getItemDetailPreview } from '../../items/data/itemDetailPreview.js'

// 표시 전용 고정 예시입니다. 실제 기록 저장이나 날짜 계산에 사용하지 않습니다.
const itemIds = [...new Set(Object.values(itemsPreviewScenarios).flatMap(scenario => scenario.items.map(item => item.id))), 'preview-custom']
export const historyPreviewEntries = itemIds.flatMap(itemId => {
  const item = getItemDetailPreview(itemId, 'scheduled')
  return item.histories.map(record => ({ item, record }))
})

export function getHistoryEditPreview(historyId) {
  const entry = historyPreviewEntries.find(({ record }) => record.id === historyId)
  if (!entry) return null
  return { ...entry, initial: { managedAt: entry.record.managedAt, productUsed: entry.record.productUsed, memo: entry.record.memo } }
}

export function getRecordFormPreview(itemId, preview) {
  const item = getItemDetailPreview(itemId, preview)
  if (!item) return null
  const initial = { managedAt: '', productUsed: '', memo: '' }
  if (import.meta.env.DEV && preview === 'filled') Object.assign(initial, { managedAt: '2026-11-07', productUsed: '중성세제', memo: '깨끗하게 세척하고 건조했어요.' })
  if (import.meta.env.DEV && preview === 'past' && itemId === 'preview-ac') Object.assign(initial, { managedAt: '2026-10-20', productUsed: '중성세제', memo: '지난번 세척 기록을 추가해요.' })
  return { item, initial }
}

// 날짜 입력에 따른 계산 대신, 피그마에 있는 특정 날짜의 예시만 표시합니다.
const dateExamples = {
  'preview-sink': {
    '2026-11-07': '마지막 관리일 2026년 11월 7일 · 다음 관리일 2026년 11월 21일',
  },
  'preview-ac': {
    '2026-11-07': '마지막 관리일 2026년 11월 7일 · 다음 관리일 2026년 11월 21일',
    '2026-10-20': '더 최근인 10월 26일 기록이 있어요. 이번 기록을 추가해도 마지막 관리일은 10월 26일, 다음 관리일은 11월 9일이에요.',
  },
}

export function getRecordDateExample(itemId, managedAt) {
  if (!Object.hasOwn(dateExamples, itemId)) return null
  return Object.hasOwn(dateExamples[itemId], managedAt) ? dateExamples[itemId][managedAt] : null
}
