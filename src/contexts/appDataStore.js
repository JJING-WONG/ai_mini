import { addHistoryData, updateHistoryData, deleteHistoryData } from '../services/historyService.js'
import { addItemData, updateItemData, deleteItemData } from '../services/itemService.js'
import { recoverPendingTransactions, saveOnboardingSnapshot, saveDataSnapshot } from '../repositories/transactionRepository.js'
import { buildOnboardingData } from '../services/onboardingService.js'
import { spaceRepository } from '../repositories/spaceRepository.js'
import { itemRepository } from '../repositories/itemRepository.js'
import { historyRepository } from '../repositories/historyRepository.js'
import { onboardingRepository, emptyOnboarding } from '../repositories/onboardingRepository.js'
import { validateResource, validateReferences } from '../repositories/dataValidation.js'
import { StorageError } from '../repositories/storageRepository.js'

export const emptyAppData = { spaces: [], items: [], histories: [], onboarding: emptyOnboarding }
const repositories = { spaces: spaceRepository, items: itemRepository, histories: historyRepository, onboarding: onboardingRepository }

export function loadAppData() {
  recoverPendingTransactions()
  const data = Object.fromEntries(Object.entries(repositories).map(([name, repository]) => [name, repository.load()]))
  if (!validateReferences(data)) throw new StorageError('저장 데이터의 공간·항목·기록 연결을 확인할 수 없어요. 원본은 변경하지 않았어요.')
  return data
}

// 한 종류의 데이터를 저장한 뒤 상태를 갱신합니다. 여러 종류를 묶은 저장은 온보딩 단계에서 구현합니다.
export function saveAppResource(data, resource, value) {
  if (!Object.hasOwn(repositories, resource)) throw new StorageError('지원하지 않는 데이터예요.')
  const next = { ...data, [resource]: value }
  if (!validateResource(resource, value) || !validateReferences(next)) {
    throw new StorageError('데이터 형식이나 연결이 올바르지 않아 저장하지 않았어요.')
  }
  const saved = repositories[resource].save(value)
  return { ...data, [resource]: saved }
}

export function completeOnboardingData(data, wizard, options) {
  return saveOnboardingSnapshot(buildOnboardingData(data, wizard, options))
}

export function addStoredItem(data, values, space, options) {
  const result = addItemData(data, values, space, options)
  return { data: saveDataSnapshot(result.data), itemId: result.itemId }
}
export function updateStoredItem(data, itemId, values, space) {
  const result = updateItemData(data, itemId, values, space)
  return { data: saveDataSnapshot(result.data), itemId }
}
export function deleteStoredItem(data, itemId) {
  return { data: saveDataSnapshot(deleteItemData(data, itemId)) }
}

// 기록은 하나의 배열 키만 변경하므로 localStorage의 단일 setItem 성공 후 상태를 반영합니다.
function saveHistoryResult(original, result) {
  return { ...result, data: saveAppResource(original, 'histories', result.data.histories) }
}
export function addStoredHistory(data, itemId, values, options) {
  return saveHistoryResult(data, addHistoryData(data, itemId, values, options))
}
export function updateStoredHistory(data, historyId, values, options) {
  return saveHistoryResult(data, updateHistoryData(data, historyId, values, options))
}
export function deleteStoredHistory(data, historyId) {
  return saveHistoryResult(data, deleteHistoryData(data, historyId))
}
