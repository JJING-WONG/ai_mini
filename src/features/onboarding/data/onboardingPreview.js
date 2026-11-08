import { defaultSpaces } from '../../../data/defaultSpaces.js'
import { defaultItems } from '../../../data/defaultItems.js'

export function createOnboardingSelection(template) {
  return {
    key: `onboarding-${template.id}`, templateId: template.id, spaceId: template.spaceId,
    name: template.name, interval: template.recommendedIntervalDays == null ? '' : String(template.recommendedIntervalDays),
    managedAt: '', unknownDate: true,
  }
}

// 온보딩 디자인 확인용 초기 상태입니다. 사용자 공간·Item·History를 생성하지 않습니다.
export function createOnboardingPreview(preview) {
  const state = { step: 'welcome', spaces: defaultSpaces.map(space => ({ ...space })), selectedSpaceIds: [], selectedItems: [], spaceIndex: 0 }
  if (!import.meta.env.DEV) return state
  if (preview === 'spaces') return { ...state, step: 'spaces', selectedSpaceIds: ['bathroom'] }
  if (preview === 'items') return { ...state, step: 'items', selectedSpaceIds: ['bathroom'], selectedItems: [createOnboardingSelection(defaultItems.find(item => item.id === 'bathroom-floor-drain'))] }
  if (preview === 'cycles') return { ...state, step: 'cycles', selectedSpaceIds: ['kitchen', 'bathroom'], selectedItems: ['kitchen-sink-drain', 'kitchen-hood-filter', 'bathroom-floor-drain', 'bathroom-showerhead'].map(id => createOnboardingSelection(defaultItems.find(item => item.id === id))) }
  if (preview === 'custom') return { ...state, step: 'cycles', spaces: [...state.spaces, { id: 'onboarding-space-preview', name: '베란다' }], selectedSpaceIds: ['onboarding-space-preview'], selectedItems: [{ key: 'onboarding-item-preview', templateId: null, spaceId: 'onboarding-space-preview', name: '베란다 바닥 청소', interval: '', managedAt: '', unknownDate: true }] }
  return state
}
