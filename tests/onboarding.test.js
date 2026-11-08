import { test } from 'vitest'
import assert from 'node:assert/strict'
import { createEmptyWizard, createOnboardingDraft, restoreOnboarding, validateOnboarding, buildOnboardingData } from '../src/services/onboardingService.js'
import { saveOnboardingSnapshot, recoverPendingOnboarding } from '../src/repositories/transactionRepository.js'
import { emptyAppData } from '../src/contexts/appDataStore.js'
import { onboardingDestination } from '../src/app/routingPolicy.js'

function wizard() {
  return { ...createEmptyWizard(), step: 'cycles', selectedSpaceIds: ['kitchen'],
    selectedItems: [{ key: 'choice-1', templateId: 'kitchen-sink-drain', spaceId: 'kitchen', name: '배수구 청소', interval: '14', managedAt: '2026-10-26', unknownDate: false }] }
}
function storage() {
  const data = new Map()
  return { data, getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)), removeItem: key => data.delete(key) }
}
const options = () => { let counter = 0; return { id: () => String(++counter), now: () => '2026-11-08T00:00:00.000Z', today: '2026-11-08' } }

test('선택 공간·기본 항목·권장 주기·초기 관리일을 저장 모델로 변환한다', () => {
  const data = buildOnboardingData(emptyAppData, wizard(), options())
  assert.deepEqual(data.spaces, [{ id: 'kitchen', name: '주방' }])
  assert.equal(data.items[0].templateId, 'kitchen-sink-drain')
  assert.notEqual(data.items[0].id, data.items[0].templateId)
  assert.equal(data.items[0].intervalDays, 14)
  assert.equal(data.histories[0].type, 'initial')
  assert.equal(data.histories[0].managedAt, '2026-10-26')
  assert.equal(data.histories[0].itemId, data.items[0].id)
  assert.ok(data.onboarding.completed)
  assert.deepEqual(data.onboarding.draft, {})
  assert.ok(!Object.hasOwn(data.items[0], 'status'))
})

test('사용자 지정 공간·항목, 주기와 관리일 미설정을 지원한다', () => {
  const state = wizard()
  state.spaces.push({ id: 'space-custom', name: '베란다' })
  state.selectedSpaceIds = ['space-custom']
  state.selectedItems = [{ ...state.selectedItems[0], templateId: null, spaceId: 'space-custom', interval: '', managedAt: '', unknownDate: true }]
  const data = buildOnboardingData(emptyAppData, state, options())
  assert.equal(data.items[0].templateId, null)
  assert.equal(data.items[0].intervalDays, null)
  assert.equal(data.histories.length, 0)
  assert.equal(data.spaces[0].name, '베란다')
})

test('단계·직접 추가 항목·입력 중인 오류 값도 초안으로 복원한다', () => {
  const state = wizard()
  state.spaces.push({ id: 'space-custom', name: '베란다' })
  state.customItems = [{ ...state.selectedItems[0], key: 'custom-choice', templateId: null, spaceId: 'space-custom', interval: '0' }]
  state.selectedItems.push(state.customItems[0])
  const draft = JSON.parse(JSON.stringify(createOnboardingDraft(state)))
  assert.deepEqual(restoreOnboarding(draft).wizard, state)
  assert.equal(restoreOnboarding(draft).warning, '')
  assert.equal(restoreOnboarding({ ...draft, draft: { ...draft.draft, spaces: null } }).wizard.step, 'welcome')
  assert.ok(restoreOnboarding({ ...draft, draft: { ...draft.draft, spaces: null } }).warning)
})

test('0·소수·미래 및 잘못된 날짜와 빈 전체 선택은 완료를 막는다', () => {
  for (const interval of ['0', '-1', '1.5', 'Infinity', '9007199254740992']) {
    const state = wizard(); state.selectedItems[0].interval = interval
    assert.ok(validateOnboarding(state, '2026-11-08').fields['choice-1'].interval)
  }
  for (const managedAt of ['2099-01-01', '2026-02-29', '2026-04-31']) {
    const state = wizard(); state.selectedItems[0].managedAt = managedAt
    assert.ok(validateOnboarding(state, '2026-11-08').fields['choice-1'].managedAt)
  }
  const state = wizard(); state.selectedItems = []
  assert.ok(validateOnboarding(state).summary)
  assert.throws(() => buildOnboardingData(emptyAppData, state, options()))
})

test('이미 완료한 상태에서 중복 완료를 거부하고 기존 항목은 보존한다', () => {
  const data = buildOnboardingData(emptyAppData, wizard(), options())
  assert.throws(() => buildOnboardingData(data, wizard(), options()))
  const second = buildOnboardingData({ ...data, onboarding: emptyAppData.onboarding }, wizard(), { ...options(), id: () => 'new' })
  assert.equal(second.items.length, 2)
  assert.equal(second.items[0].id, data.items[0].id)
})

test('네 저장 키가 성공하면 복구 기록을 지운다', () => {
  const store = storage()
  const data = buildOnboardingData(emptyAppData, wizard(), options())
  assert.deepEqual(saveOnboardingSnapshot(data, () => store), data)
  assert.equal(store.data.size, 4)
  assert.equal(JSON.parse(store.getItem('homeguide:onboarding')).completed, true)
  assert.equal(store.getItem('homeguide:pending-onboarding'), null)
})

test('각 저장 단계에서 실패해도 이전 원본을 복원한다', () => {
  for (let failAt = 1; failAt <= 6; failAt++) {
    const store = storage()
    store.setItem('homeguide:onboarding', JSON.stringify(createOnboardingDraft(wizard())))
    const before = new Map(store.data)
    const originalSet = store.setItem; const originalRemove = store.removeItem
    let operations = 0
    const fail = () => { if (++operations === failAt) throw new Error('QuotaExceededError') }
    store.setItem = (key, value) => { fail(); originalSet(key, value) }
    store.removeItem = key => { fail(); originalRemove(key) }
    assert.throws(() => saveOnboardingSnapshot(buildOnboardingData(emptyAppData, wizard(), options()), () => store))
    assert.deepEqual(store.data, before, `operation ${failAt}`)
  }
})

test('즉시 복구 불가 시 정보를 보존하고 다음 불러오기에서 복구한다', () => {
  const store = storage()
  const before = { spaces: null, items: null, histories: null, onboarding: JSON.stringify(createOnboardingDraft(wizard())) }
  store.setItem('homeguide:onboarding', before.onboarding)
  const originalSet = store.setItem
  store.setItem = (key, value) => {
    if (key === 'homeguide:items' || key === 'homeguide:onboarding') throw new Error('blocked')
    originalSet(key, value)
  }
  assert.throws(() => saveOnboardingSnapshot(buildOnboardingData(emptyAppData, wizard(), options()), () => store), error => error.requiresReload === true)
  assert.ok(store.getItem('homeguide:pending-onboarding'))
  store.setItem = originalSet
  recoverPendingOnboarding(() => store)
  for (const key of Object.keys(before)) assert.equal(store.getItem(`homeguide:${key}`), before[key])
  assert.equal(store.getItem('homeguide:pending-onboarding'), null)
})

test('강제 종료의 미완료 저장과 손상된 복구 기록을 안전하게 처리한다', () => {
  const store = storage()
  const before = { spaces: null, items: null, histories: null, onboarding: null }
  store.setItem('homeguide:pending-onboarding', JSON.stringify({ version: 1, before }))
  store.setItem('homeguide:items', 'partial')
  recoverPendingOnboarding(() => store)
  assert.equal(store.data.size, 0)
  store.setItem('homeguide:pending-onboarding', '{broken')
  assert.throws(() => recoverPendingOnboarding(() => store))
  assert.equal(store.getItem('homeguide:pending-onboarding'), '{broken')
})

test('온보딩 접근 정책과 개발용 미리보기 예외를 구분한다', () => {
  const route = (pathname, completed, search = '', development = false) => onboardingDestination({ pathname, completed, search, development })
  assert.equal(route('/', false), null)
  assert.equal(route('/', true), '/home')
  for (const path of ['/home', '/items', '/items/new', '/history', '/items/item-1/record']) {
    assert.equal(route(path, false), '/')
    assert.equal(route(path, true), null)
  }
  assert.equal(route('/', true, '?preview=cycles', true), null)
  assert.equal(route('/', true, '?preview=cycles', false), '/home')
  assert.equal(route('/', true, '?preview=default', true), '/home')
  assert.equal(route('/items', false, '?preview=default', true), null)
  assert.equal(route('/items', false, '?preview=unknown', true), '/')
})
