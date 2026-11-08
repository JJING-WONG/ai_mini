import { test } from 'vitest'
import assert from 'node:assert/strict'
import { createRepository, StorageError } from '../src/repositories/storageRepository.js'
import { loadAppData, saveAppResource, emptyAppData } from '../src/contexts/appDataStore.js'

function memoryStorage() {
  const data = new Map()
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)), data }
}
const space = { id: 'kitchen', name: '주방' }
const item = { id: 'item-1', templateId: 'living-ac-filter', spaceId: 'kitchen', name: '에어컨 필터 청소', intervalDays: 14, modelName: '', specification: '', image: null, memo: '', createdAt: '2026-11-08T00:00:00.000Z' }
const history = { id: 'history-1', itemId: item.id, managedAt: '2026-10-26', type: 'completed', productUsed: '', memo: '', createdAt: item.createdAt }

test('처음 조회는 빈 배열이며 기본 콘텐츠를 자동 저장하지 않는다', () => {
  const storage = memoryStorage()
  const repository = createRepository('items', [], () => storage)
  assert.deepEqual(repository.load(), [])
  assert.equal(storage.data.size, 0)
})

test('저장 후 새 Repository 인스턴스에서 같은 데이터를 불러온다', () => {
  const storage = memoryStorage()
  createRepository('items', [], () => storage).save([item])
  const loaded = createRepository('items', [], () => storage).load()
  assert.deepEqual(loaded, [item])
  loaded[0].name = '화면 변경'
  assert.equal(createRepository('items', [], () => storage).load()[0].name, item.name)
})

test('손상된 JSON·형식은 원본을 지우거나 덮어쓰지 않는다', () => {
  for (const raw of ['{broken', '{}', JSON.stringify([{ ...item, intervalDays: 0 }]), JSON.stringify([item, item])]) {
    const storage = memoryStorage()
    storage.setItem('homeguide:items', raw)
    assert.throws(() => createRepository('items', [], () => storage).load(), StorageError)
    assert.equal(storage.getItem('homeguide:items'), raw)
  }
})

test('잘못된 데이터 저장은 기존 값 보존: 기본 콘텐츠 ID·파생 상태·주기', () => {
  const storage = memoryStorage()
  const repository = createRepository('items', [], () => storage)
  repository.save([item])
  for (const invalid of [{ ...item, id: 'living-ac-filter' }, { ...item, status: 'today' }, { ...item, intervalDays: 1.5 }, { ...item, templateId: 'missing' }]) {
    assert.throws(() => repository.save([invalid]), StorageError)
    assert.deepEqual(repository.load(), [item])
  }
  repository.save([{ ...item, templateId: null, intervalDays: null }])
  assert.equal(repository.load()[0].intervalDays, null)
})

test('저장소 접근 거부·용량 부족을 StorageError로 전달한다', () => {
  const denied = () => { throw new Error('SecurityError') }
  assert.throws(() => createRepository('items', [], denied).load(), StorageError)
  assert.throws(() => createRepository('items', [], denied).save([item]), StorageError)
  const full = { getItem: () => null, setItem() { throw new Error('QuotaExceededError') } }
  assert.throws(() => createRepository('items', [], () => full).save([item]), StorageError)
})

test('실제 달력에 없는 날짜와 중복 기록 ID를 거부한다', () => {
  const repository = createRepository('histories', [], () => memoryStorage())
  for (const managedAt of ['2026-02-29', '2026-04-31', '2026-13-01', '2026-1-01']) {
    assert.throws(() => repository.save([{ ...history, managedAt }]), StorageError)
  }
  assert.doesNotThrow(() => repository.save([{ ...history, managedAt: '2024-02-29' }]))
  assert.throws(() => repository.save([history, history]), StorageError)
  assert.doesNotThrow(() => repository.save([history, { ...history, id: 'history-2' }]))
})

test('온보딩 기본값과 초안 왕복 저장을 지원한다', () => {
  const storage = memoryStorage()
  const initial = { completed: false, currentStep: 'welcome', selectedSpaceIds: [], draft: {} }
  const repository = createRepository('onboarding', initial, () => storage)
  assert.deepEqual(repository.load(), initial)
  const draft = { ...initial, currentStep: 'spaces', selectedSpaceIds: ['kitchen'], draft: { name: '주방' } }
  repository.save(draft)
  assert.deepEqual(repository.load(), draft)
})

test('연결 관계 검사와 저장 성공 이후에만 새 상태를 반환한다', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const storage = memoryStorage()
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage })
  try {
    let state = loadAppData()
    assert.deepEqual(state, emptyAppData)
    assert.throws(() => saveAppResource(state, 'items', [item]), StorageError)
    assert.equal(storage.data.size, 0)
    state = saveAppResource(state, 'spaces', [space])
    state = saveAppResource(state, 'items', [item])
    state = saveAppResource(state, 'histories', [history])
    assert.deepEqual(loadAppData(), state)
    assert.throws(() => saveAppResource(state, 'items', []), StorageError)
    assert.throws(() => saveAppResource(state, 'spaces', []), StorageError)
    assert.deepEqual(loadAppData(), state)
    storage.setItem = () => { throw new Error('QuotaExceededError') }
    assert.throws(() => saveAppResource(state, 'items', [{ ...item, name: '바뀐 이름' }]), StorageError)
    assert.equal(state.items[0].name, item.name)
    assert.deepEqual(loadAppData(), state)
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original)
    else delete globalThis.localStorage
  }
})

test('저장된 고아 기록은 삭제하지 않고 불러오기 오류를 안내한다', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const storage = memoryStorage()
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage })
  try {
    storage.setItem('homeguide:histories', JSON.stringify([history]))
    assert.throws(loadAppData, StorageError)
    assert.equal(storage.getItem('homeguide:histories'), JSON.stringify([history]))
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original)
    else delete globalThis.localStorage
  }
})
