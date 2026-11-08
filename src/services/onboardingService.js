import { isCalendarDate } from '../utils/date.js'
import { defaultSpaces } from '../data/defaultSpaces.js'
import { defaultItems } from '../data/defaultItems.js'
import { validateResource } from '../repositories/dataValidation.js'
import { localInputDate } from '../utils/formFeedback.js'

export function createEmptyWizard() {
  return { step: 'welcome', spaces: defaultSpaces.map(space => ({ ...space })), selectedSpaceIds: [], selectedItems: [], customItems: [], spaceIndex: 0 }
}
const isChoice = (item, spaces) => item && typeof item.key === 'string' && item.key.length > 0
  && typeof item.name === 'string' && item.name.trim().length > 0 && spaces.some(space => space.id === item.spaceId)
  && (item.templateId === null || defaultItems.some(template => template.id === item.templateId && template.spaceId === item.spaceId))
  && typeof item.interval === 'string' && typeof item.managedAt === 'string' && typeof item.unknownDate === 'boolean'
const unique = (values, key) => new Set(values.map(value => value[key])).size === values.length

export function restoreOnboarding(onboarding) {
  const fallback = createEmptyWizard()
  if (!Object.keys(onboarding.draft).length) return { wizard: fallback, warning: '' }
  const draft = onboarding.draft
  const { spaces, selectedItems, customItems, spaceIndex } = draft
  const valid = validateResource('spaces', spaces) && Array.isArray(selectedItems) && Array.isArray(customItems)
    && selectedItems.every(item => isChoice(item, spaces)) && unique(selectedItems, 'key')
    && customItems.every(item => isChoice(item, spaces) && item.templateId === null) && unique(customItems, 'key')
    && onboarding.selectedSpaceIds.every(id => spaces.some(space => space.id === id))
    && Number.isSafeInteger(spaceIndex) && spaceIndex >= 0
    && (onboarding.currentStep !== 'items' || spaceIndex < onboarding.selectedSpaceIds.length)
    && (!['items', 'cycles'].includes(onboarding.currentStep) || onboarding.selectedSpaceIds.length > 0)
    && (onboarding.currentStep !== 'cycles' || selectedItems.some(item => onboarding.selectedSpaceIds.includes(item.spaceId)))
  if (!valid) return { wizard: fallback, warning: '저장된 진행 내용을 복원할 수 없어 시작 화면을 표시했어요. 기존 데이터는 변경하지 않았어요. 공간 선택부터 다시 진행해 주세요.' }
  return { wizard: { step: onboarding.currentStep, spaces, selectedItems, customItems, spaceIndex, selectedSpaceIds: onboarding.selectedSpaceIds }, warning: '' }
}

export function createOnboardingDraft(wizard) {
  return { completed: false, currentStep: wizard.step, selectedSpaceIds: [...wizard.selectedSpaceIds],
    draft: { spaces: wizard.spaces, selectedItems: wizard.selectedItems, customItems: wizard.customItems, spaceIndex: wizard.spaceIndex } }
}

export function validateOnboarding(wizard, today = localInputDate()) {
  const errors = {}
  const spaces = wizard.spaces.filter(space => wizard.selectedSpaceIds.includes(space.id))
  const items = wizard.selectedItems.filter(item => wizard.selectedSpaceIds.includes(item.spaceId))
  if (!spaces.length || !items.length) return { summary: '공간과 관리 항목을 각각 하나 이상 선택해 주세요.', fields: errors }
  for (const item of items) {
    const field = {}
    if (item.interval !== '' && (!/^\d+$/.test(item.interval) || !Number.isSafeInteger(Number(item.interval)) || Number(item.interval) < 1)) {
      field.interval = '양의 정수 일수를 입력하거나 비워 주세요.'
    }
    if (!item.unknownDate && item.managedAt) {
      if (!isCalendarDate(item.managedAt) || item.managedAt > today) field.managedAt = '오늘 또는 과거의 올바른 날짜를 입력해 주세요.'
    }
    if (Object.keys(field).length) errors[item.key] = field
  }
  return { summary: Object.keys(errors).length ? '주기와 관리 날짜를 확인해 주세요.' : '', fields: errors }
}

export function buildOnboardingData(data, wizard, { id = () => crypto.randomUUID(), now = () => new Date().toISOString(), today = localInputDate() } = {}) {
  if (data.onboarding.completed) throw new Error('이미 초기 설정이 완료되었어요.')
  const check = validateOnboarding(wizard, today)
  if (check.summary) throw new Error(check.summary)
  const createdAt = now()
  const selectedSpaces = wizard.spaces.filter(space => wizard.selectedSpaceIds.includes(space.id))
  const spaces = [...data.spaces]
  for (const space of selectedSpaces) if (!spaces.some(existing => existing.id === space.id)) spaces.push({ id: space.id, name: space.name })
  const items = [...data.items]
  const histories = [...data.histories]
  for (const selection of wizard.selectedItems.filter(item => wizard.selectedSpaceIds.includes(item.spaceId))) {
    const itemId = `item-${id()}`
    items.push({ id: itemId, templateId: selection.templateId, spaceId: selection.spaceId, name: selection.name.trim(),
      intervalDays: selection.interval === '' ? null : Number(selection.interval), modelName: '', specification: '', image: null, memo: '', createdAt })
    if (!selection.unknownDate && selection.managedAt) histories.push({ id: `history-${id()}`, itemId, managedAt: selection.managedAt, type: 'initial', productUsed: '', memo: '', createdAt })
  }
  return { spaces, items, histories, onboarding: { completed: true, currentStep: 'cycles', selectedSpaceIds: selectedSpaces.map(space => space.id), draft: {} } }
}
