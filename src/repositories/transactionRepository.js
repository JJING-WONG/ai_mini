import { validateReferences, validateResource } from './dataValidation.js'
import { StorageError } from './storageRepository.js'

const resources = ['spaces', 'items', 'histories', 'onboarding']
const onboardingJournalKey = 'homeguide:pending-onboarding'
const dataJournalKey = 'homeguide:pending-data'

function restore(storage, before, journalKey) {
  for (const resource of resources) {
    const raw = before[resource]
    if (raw === null) storage.removeItem(`homeguide:${resource}`)
    else storage.setItem(`homeguide:${resource}`, raw)
  }
  storage.removeItem(journalKey)
}

function recoverJournal(journalKey, getStorage) {
  try {
    const storage = getStorage()
    const raw = storage.getItem(journalKey)
    if (raw === null) return
    const journal = JSON.parse(raw)
    if (journal?.version !== 1 || !journal.before || !resources.every(resource =>
      Object.hasOwn(journal.before, resource) && (journal.before[resource] === null || typeof journal.before[resource] === 'string'))) {
      throw new Error('Invalid transaction journal')
    }
    restore(storage, journal.before, journalKey)
  } catch (cause) {
    const error = new StorageError('중단된 데이터 저장을 복구하지 못했어요. 원본 복구 정보는 보존했어요. 저장소 접근을 확인하고 다시 불러와 주세요.', { cause })
    error.requiresReload = true
    throw error
  }
}

export function recoverPendingOnboarding(getStorage = () => globalThis.localStorage) {
  recoverJournal(onboardingJournalKey, getStorage)
}

export function recoverPendingTransactions(getStorage = () => globalThis.localStorage) {
  recoverJournal(onboardingJournalKey, getStorage)
  recoverJournal(dataJournalKey, getStorage)
}

// 네 키를 모두 저장한 뒤에만 완료로 처리합니다. 중간 실패·앱 종료 시 이전 값을 복구합니다.
export function saveDataSnapshot(data, getStorage = () => globalThis.localStorage, operation = '데이터', journalKey = dataJournalKey) {
  if (!resources.every(resource => validateResource(resource, data[resource])) || !validateReferences(data)) {
    throw new StorageError('데이터 형식이나 연결이 올바르지 않아 저장하지 않았어요.')
  }
  let storage
  let before
  let journalWritten = false
  try {
    storage = getStorage()
    recoverPendingTransactions(getStorage)
    const serialized = Object.fromEntries(resources.map(resource => [resource, JSON.stringify(data[resource])]))
    before = Object.fromEntries(resources.map(resource => [resource, storage.getItem(`homeguide:${resource}`)]))
    storage.setItem(journalKey, JSON.stringify({ version: 1, before }))
    journalWritten = true
    for (const resource of resources) storage.setItem(`homeguide:${resource}`, serialized[resource])
    storage.removeItem(journalKey)
    return JSON.parse(JSON.stringify(data))
  } catch (cause) {
    if (cause.requiresReload) throw cause
    if (journalWritten) {
      try { restore(storage, before, journalKey) } catch (rollbackCause) {
        const error = new StorageError(`${operation} 저장과 복구를 완료하지 못했어요. 복구 정보는 보존했어요. 다시 불러오기를 눌러 주세요.`, { cause: rollbackCause })
        error.requiresReload = true
        throw error
      }
    }
    throw new StorageError(`${operation} 변경을 저장하지 못했어요. 다시 시도해 주세요.`, { cause })
  }
}

export function saveOnboardingSnapshot(data, getStorage = () => globalThis.localStorage) {
  return saveDataSnapshot(data, getStorage, '온보딩', onboardingJournalKey)
}
