import { historyPreviewEntries } from './historyFormPreview.js'

// 피그마 예시 날짜의 표시 문구입니다. Date 변환이나 시간대 연산은 하지 않습니다.
const dateLabels = {
  '2026-11-07': '11월 7일 (토)',
  '2026-10-26': '10월 26일 (월)',
  '2026-10-12': '10월 12일 (월)',
  '2026-10-08': '10월 8일 (목)',
  '2026-10-06': '10월 6일 (화)',
  '2026-05-24': '5월 24일 (일)',
}

export function getHistoryListPreview(preview) {
  const mode = import.meta.env.DEV ? preview : null
  const sorted = [...historyPreviewEntries].sort((a, b) => b.record.managedAt.localeCompare(a.record.managedAt))
  const entries = mode === 'empty' ? [] : mode === 'single' ? sorted.slice(0, 1) : sorted
  const groups = new Map()
  for (const entry of entries) {
    const date = entry.record.managedAt
    if (!groups.has(date)) groups.set(date, {
      date, label: dateLabels[date] || entry.record.managedAtLabel,
      accessibleLabel: entry.record.managedAtLabel, entries: [],
    })
    groups.get(date).entries.push(entry)
  }
  return { count: entries.length, compact: mode === 'single', groups: [...groups.values()] }
}
