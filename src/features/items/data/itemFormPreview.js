import { defaultSpaces } from '../../../data/defaultSpaces.js'
import { getItemDetailPreview } from './itemDetailPreview.js'

const intervals = {
  'preview-sink': '14', 'preview-hood': '30', 'preview-laundry': '30',
  'preview-ac': '14', 'preview-screen': '180',
}

// 폼 표시 전용 초기값입니다. 입력은 화면 내부에서만 유지하며 저장하지 않습니다.
export function getItemFormPreview(itemId, preview) {
  if (itemId) {
    const item = getItemDetailPreview(itemId)
    if (!item) return null
    const spaceId = defaultSpaces.find(space => space.name === item.spaceName)?.id || 'preview-balcony'
    return {
      spaceId, templateId: item.templateId || '', name: item.name,
      interval: intervals[itemId] || '', modelName: item.modelName,
      specification: item.specification, memo: item.memo,
    }
  }
  const initial = { spaceId: 'kitchen', templateId: '', name: '', interval: '', modelName: '', specification: '', memo: '' }
  if (import.meta.env.DEV && preview === 'template') return { ...initial, templateId: 'kitchen-hood-filter', name: '주방 후드 필터 세척', interval: '30' }
  if (import.meta.env.DEV && preview === 'filled') return { ...initial, name: '주방 수납장 정리', interval: '30', modelName: '주방 수납장', specification: '상부장 2칸', memo: '유통기한을 확인하고 선반을 닦기' }
  return initial
}
