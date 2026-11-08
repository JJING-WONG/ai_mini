import { test } from 'vitest'
import assert from 'node:assert/strict'
import { addItemData, updateItemData, deleteItemData, validateItemInput } from '../src/services/itemService.js'
import { addStoredItem, updateStoredItem, deleteStoredItem, loadAppData, emptyAppData } from '../src/contexts/appDataStore.js'
import { saveDataSnapshot, recoverPendingTransactions } from '../src/repositories/transactionRepository.js'
import { maxItemImageBytes, validateItemImageFile } from '../src/utils/itemImage.js'
import { defaultItems } from '../src/data/defaultItems.js'

const values = { spaceId: 'kitchen', templateId: 'kitchen-sink-drain', name: '배수구 청소', interval: '14', modelName: '모델A', specification: '규격B', image: null, memo: '메모C' }
const options = { id: () => 'test', now: () => '2026-11-08T00:00:00.000Z' }
function memoryStorage() {
  const data = new Map()
  return { data, getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)), removeItem: key => data.delete(key) }
}
function withStorage(run) {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const storage = memoryStorage()
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage })
  try { return run(storage) } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original)
    else delete globalThis.localStorage
  }
}
function dataWithRecords() {
  const data = addItemData(emptyAppData, values, undefined, options).data
  data.items.push({ ...data.items[0], id: 'item-other' })
  data.histories = [
    { id: 'history-own', itemId: 'item-test', managedAt: '2026-10-26', type: 'initial', productUsed: '', memo: '', createdAt: options.now() },
    { id: 'history-other', itemId: 'item-other', managedAt: '2026-10-25', type: 'completed', productUsed: '다른 세제', memo: '', createdAt: options.now() },
  ]
  return data
}

test('기본 항목 추가 시 사용자 ID·주기·정보를 저장하고 기본 콘텐츠는 유지한다', () => {
  const before = JSON.stringify(defaultItems)
  const { data, itemId } = addItemData(emptyAppData, values, undefined, options)
  assert.equal(itemId, 'item-test')
  assert.equal(data.items[0].templateId, values.templateId)
  assert.equal(data.items[0].intervalDays, 14)
  assert.equal(data.items[0].modelName, '모델A')
  assert.equal(data.spaces[0].id, 'kitchen')
  assert.equal(data.histories.length, 0)
  assert.equal(JSON.stringify(defaultItems), before)
  assert.equal(emptyAppData.items.length, 0)
})

test('직접 공간과 항목·빈 주기를 함께 추가하며 중복 공간은 만들지 않는다', () => {
  const space = { id: 'space-balcony', name: '베란다' }
  const input = { ...values, name: '  바닥 청소  ', templateId: '', interval: '', spaceId: space.id }
  const result = addItemData(emptyAppData, input, space, options)
  assert.equal(result.data.items[0].templateId, null)
  assert.equal(result.data.items[0].intervalDays, null)
  assert.equal(result.data.items[0].name, '바닥 청소')
  const second = addItemData(result.data, input, space, { ...options, id: () => 'second' })
  assert.equal(second.data.spaces.length, 1)
  assert.equal(second.data.items.length, 2)
})

test('이름 변경은 템플릿 연결과 ID·생성일·기록을 보존한다', () => {
  const data = dataWithRecords()
  const before = JSON.stringify(data)
  const result = updateItemData(data, 'item-test', { ...values, name: '내 배수구 청소', interval: '30' })
  assert.equal(result.data.items[0].templateId, values.templateId)
  assert.equal(result.data.items[0].id, data.items[0].id)
  assert.equal(result.data.items[0].createdAt, data.items[0].createdAt)
  assert.equal(result.data.items[0].intervalDays, 30)
  assert.deepEqual(result.data.histories, data.histories)
  assert.equal(JSON.stringify(data), before)
})

test('명시적인 직접 등록 전환만 연결을 해제하고 다른 기본 항목으로 교체는 막는다', () => {
  const data = dataWithRecords()
  const result = updateItemData(data, 'item-test', { ...values, templateId: '' })
  assert.equal(result.data.items[0].templateId, null)
  assert.deepEqual(result.data.histories, data.histories)
  assert.throws(() => updateItemData(data, 'item-test', { ...values, templateId: 'living-ac-filter' }))
})

test('공간 이동과 이미지 교체·제거를 지원하고 기록은 유지한다', () => {
  const data = dataWithRecords()
  const image = 'data:image/png;base64,aGVsbG8='
  const result = updateItemData(data, 'item-test', { ...values, spaceId: 'bathroom', image })
  assert.equal(result.data.items[0].spaceId, 'bathroom')
  assert.equal(result.data.items[0].image, image)
  assert.equal(result.data.spaces.length, 2)
  assert.deepEqual(result.data.histories, data.histories)
  const removed = updateItemData(result.data, 'item-test', { ...values, image: null })
  assert.equal(removed.data.items[0].image, null)
})

test('삭제 시 대상 항목과 연결된 기록만 지운다', () => {
  const data = dataWithRecords()
  const result = deleteItemData(data, 'item-test')
  assert.deepEqual(result.items.map(item => item.id), ['item-other'])
  assert.deepEqual(result.histories.map(record => record.id), ['history-other'])
  assert.deepEqual(result.spaces, data.spaces)
  assert.equal(data.items.length, 2)
  assert.equal(data.histories.length, 2)
})

test('잘못된 입력·이미지·없는 항목·ID 충돌을 거부한다', () => {
  for (const interval of ['0', '-1', '1.2', '1e2', '9007199254740992']) assert.ok(validateItemInput({ ...values, interval }).interval)
  assert.ok(validateItemInput({ ...values, name: ' ' }).name)
  assert.ok(validateItemInput({ ...values, spaceId: '' }).spaceId)
  assert.throws(() => addItemData(emptyAppData, { ...values, image: 'blob:temporary' }, undefined, options))
  assert.throws(() => addItemData(emptyAppData, { ...values, spaceId: 'missing' }, undefined, options))
  assert.throws(() => updateItemData(emptyAppData, 'missing', values))
  assert.throws(() => deleteItemData(emptyAppData, 'missing'))
  const data = addItemData(emptyAppData, values, undefined, options).data
  assert.throws(() => addItemData(data, values, undefined, options))
})

test('이미지 형식과 용량을 검증한다', () => {
  assert.equal(validateItemImageFile({ type: 'image/png', size: maxItemImageBytes }), '')
  assert.ok(validateItemImageFile({ type: 'image/png', size: maxItemImageBytes + 1 }))
  assert.ok(validateItemImageFile({ type: 'image/svg+xml', size: 100 }))
  assert.ok(validateItemImageFile({ type: 'text/plain', size: 100 }))
  assert.ok(validateItemImageFile({ type: 'image/jpeg', size: 0 }))
})

test('추가·수정·삭제 저장 후 다시 불러올 수 있다', () => withStorage(() => {
  const data = { ...emptyAppData, onboarding: { ...emptyAppData.onboarding, completed: true } }
  const added = addStoredItem(data, values, undefined, options)
  assert.equal(loadAppData().items[0].name, values.name)
  const edited = updateStoredItem(added.data, added.itemId, { ...values, name: '수정한 이름' })
  assert.equal(loadAppData().items[0].name, '수정한 이름')
  deleteStoredItem(edited.data, edited.itemId)
  assert.deepEqual(loadAppData().items, [])
}))

test('삭제 저장 실패 시 항목·기록과 이전 원본을 함께 복구한다', () => withStorage(store => {
  const data = dataWithRecords()
  saveDataSnapshot(data)
  const before = new Map(store.data)
  const originalSet = store.setItem
  let failed = false
  store.setItem = (key, value) => {
    if (key === 'homeguide:histories' && !failed) { failed = true; throw new Error('QuotaExceededError') }
    originalSet(key, value)
  }
  assert.throws(() => deleteStoredItem(data, 'item-test'))
  assert.deepEqual(store.data, before)
  assert.deepEqual(loadAppData(), data)
}))

test('이미지 저장 용량 부족은 추가·수정 전 원본을 보존한다', () => withStorage(store => {
  const data = dataWithRecords()
  saveDataSnapshot(data)
  const before = new Map(store.data)
  const originalSet = store.setItem
  store.setItem = (key, value) => {
    if (key === 'homeguide:items' && value.includes('data:image/')) throw new Error('QuotaExceededError')
    originalSet(key, value)
  }
  assert.throws(() => updateStoredItem(data, 'item-test', { ...values, image: 'data:image/png;base64,aGVsbG8=' }))
  assert.deepEqual(store.data, before)
}))

test('항목 저장 중 앱 종료 시 공통 복구 키로 이전 값을 복원한다', () => {
  const store = memoryStorage()
  const before = { spaces: null, items: null, histories: null, onboarding: null }
  store.setItem('homeguide:pending-data', JSON.stringify({ version: 1, before }))
  store.setItem('homeguide:items', 'partial')
  recoverPendingTransactions(() => store)
  assert.equal(store.data.size, 0)
})
