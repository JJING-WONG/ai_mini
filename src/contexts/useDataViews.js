import { calculateMaintenance, sortByMaintenancePriority } from '../services/maintenanceService.js'
import { getLocalToday } from '../utils/date.js'
import { useAppData } from './AppDataContext.js'
import { getItemDetailPreview } from '../features/items/data/itemDetailPreview.js'
import { getItemFormPreview } from '../features/items/data/itemFormPreview.js'
import { getHistoryEditPreview, getRecordFormPreview } from '../features/histories/data/historyFormPreview.js'

export function formatManagedDate(value) {
  const [year, month, day] = value.split('-')
  return `${year}년 ${Number(month)}월 ${Number(day)}일`
}

// 원본 Item에 파생 값을 저장하지 않고 Service 계산 결과를 화면 문구로 변환합니다.
export function createItemViews({ items, spaces, histories }, today = getLocalToday()) {
  const spaceNames = new Map(spaces.map(space => [space.id, space.name]))
  return sortByMaintenancePriority(items.map(item => {
    const records = histories.filter(record => record.itemId === item.id)
      .sort((a, b) => b.managedAt.localeCompare(a.managedAt) || a.id.localeCompare(b.id))
      .map(record => ({ ...record, managedAtLabel: formatManagedDate(record.managedAt) }))
    const schedule = calculateMaintenance(item, histories, today)
    const statusDetail = schedule.daysUntilDue < 0 ? `${-schedule.daysUntilDue}일 지남` : schedule.daysUntilDue > 0 ? `${schedule.daysUntilDue}일 남음` : undefined
    return {
      ...item, ...schedule, statusDetail, spaceName: spaceNames.get(item.spaceId), histories: records,
      intervalLabel: item.intervalDays === null ? '미설정' : `${item.intervalDays}일마다`,
      lastManagedLabel: records[0]?.managedAtLabel || '아직 없음',
      nextManagedLabel: schedule.nextDueDate ? formatManagedDate(schedule.nextDueDate) : '계산되지 않음',
    }
  }))
}

export function useDataViews() {
  const data = useAppData()
  const today = data.today || getLocalToday()
  const items = createItemViews(data, today)
  function getItem(itemId, preview) {
    const stored = items.find(item => item.id === itemId)
    return stored || (import.meta.env.DEV && itemId?.startsWith('preview-') ? getItemDetailPreview(itemId, preview) : null)
  }
  function getItemForm(itemId, preview) {
    if (!itemId) return getItemFormPreview(undefined, preview)
    const item = items.find(item => item.id === itemId)
    if (item) return { spaceId: item.spaceId, templateId: item.templateId || '', name: item.name,
      interval: item.intervalDays === null ? '' : String(item.intervalDays), modelName: item.modelName,
      specification: item.specification, image: item.image, memo: item.memo }
    return import.meta.env.DEV && itemId.startsWith('preview-') ? getItemFormPreview(itemId, preview) : null
  }
  function getRecordForm(itemId, preview) {
    const item = items.find(item => item.id === itemId)
    if (item) return { item, initial: { managedAt: '', productUsed: '', memo: '' } }
    return import.meta.env.DEV && itemId?.startsWith('preview-') ? getRecordFormPreview(itemId, preview) : null
  }
  function getHistoryForm(historyId) {
    for (const item of items) {
      const record = item.histories.find(record => record.id === historyId)
      if (record) return { item, record, initial: { managedAt: record.managedAt, productUsed: record.productUsed, memo: record.memo } }
    }
    return import.meta.env.DEV && historyId?.startsWith('preview-') ? getHistoryEditPreview(historyId) : null
  }
  return { ...data, today, itemViews: items, getItem, getItemForm, getRecordForm, getHistoryForm }
}

export function createHistoryGroups(items) {
  const entries = items.flatMap(item => item.histories.map(record => ({ item, record })))
    .sort((a, b) => b.record.managedAt.localeCompare(a.record.managedAt) || a.record.id.localeCompare(b.record.id))
  const groups = new Map()
  for (const entry of entries) {
    const date = entry.record.managedAt
    if (!groups.has(date)) groups.set(date, { date, label: formatManagedDate(date), accessibleLabel: formatManagedDate(date), entries: [] })
    groups.get(date).entries.push(entry)
  }
  return { count: entries.length, compact: false, groups: [...groups.values()] }
}
