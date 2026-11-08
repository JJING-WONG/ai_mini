import { validateResource } from './dataValidation.js'

export class StorageError extends Error {
  constructor(message, options) { super(message, options); this.name = 'StorageError' }
}

export function createRepository(resource, fallback, getStorage = () => globalThis.localStorage) {
  const key = `homeguide:${resource}`
  const copy = value => JSON.parse(JSON.stringify(value))
  return {
    load() {
      try {
        const raw = getStorage().getItem(key)
        if (raw === null) return copy(fallback)
        const value = JSON.parse(raw)
        if (!validateResource(resource, value)) throw new Error('Invalid stored data')
        return value
      } catch (cause) {
        throw new StorageError(`${key} 데이터를 읽지 못했어요. 원본 데이터는 변경하지 않았어요.`, { cause })
      }
    },
    save(value) {
      try {
        if (!validateResource(resource, value)) throw new Error('Invalid data')
        const serialized = JSON.stringify(value)
        getStorage().setItem(key, serialized)
        return JSON.parse(serialized)
      } catch (cause) {
        throw new StorageError(`${key} 데이터를 저장하지 못했어요. 변경 사항은 적용되지 않았어요.`, { cause })
      }
    },
  }
}
