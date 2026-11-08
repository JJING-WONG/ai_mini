// @vitest-environment jsdom
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import useCalendarToday from '../src/hooks/useCalendarToday.js'
import App from '../src/App.jsx'

function start(path = '/') {
  window.history.replaceState({}, '', path)
  return render(<StrictMode><App /></StrictMode>)
}
const stored = key => JSON.parse(localStorage.getItem(`homeguide:${key}`))
function seed() {
  const createdAt = '2026-11-08T00:00:00.000Z'
  const item = { id: 'item-test', templateId: 'kitchen-sink-drain', spaceId: 'kitchen', name: '통합 시험 항목', intervalDays: 14, modelName: '', specification: '', image: null, memo: '', createdAt }
  const data = { spaces: [{ id: 'kitchen', name: '주방' }], items: [item], histories: [{ id: 'history-initial', itemId: item.id, managedAt: '2026-10-26', type: 'initial', productUsed: '', memo: '초기 메모', createdAt }], onboarding: { completed: true, currentStep: 'cycles', selectedSpaceIds: ['kitchen'], draft: {} } }
  for (const [key, value] of Object.entries(data)) localStorage.setItem(`homeguide:${key}`, JSON.stringify(value))
  return data
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 10, 8, 12))
  localStorage.clear()
  window.history.replaceState({}, '', '/')
  HTMLElement.prototype.scrollTo = vi.fn()
  // jsdom은 native modal/focus trap을 구현하지 않으므로 열림 상태만 대체합니다.
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', '') }
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open') }
})
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers() })

describe('화면·Context·Repository·라우터 통합', () => {
  test('온보딩 초안 재마운트 복원 → 완료 → 기록 작성·수정·삭제 → 항목 삭제', async () => {
    const user = userEvent.setup()
    const view = start()
    await user.click(await screen.findByRole('button', { name: '시작하기' }))
    expect(screen.getByRole('button', { name: '다음' }).disabled).toBe(true)
    await user.click(screen.getByRole('checkbox', { name: '주방' }))
    view.unmount()
    start()
    expect((await screen.findByRole('checkbox', { name: '주방' })).checked).toBe(true)
    await user.click(screen.getByRole('button', { name: '다음' }))
    await user.click(screen.getByRole('checkbox', { name: '싱크대 배수구 청소' }))
    await user.click(screen.getByRole('button', { name: '주기 설정하기' }))
    await user.click(screen.getByRole('checkbox', { name: '기억나지 않아요' }))
    fireEvent.change(screen.getByLabelText('마지막 관리일'), { target: { value: '2026-10-26' } })
    await user.click(screen.getByRole('button', { name: '설정 완료' }))
    await waitFor(() => expect(window.location.pathname).toBe('/home'))
    expect(stored('onboarding').completed).toBe(true)
    expect(stored('items')).toHaveLength(1)
    const itemId = stored('items')[0].id
    const initialId = stored('histories')[0].id
    await user.click(screen.getByRole('link', { name: '싱크대 배수구 청소' }))
    expect(window.location.pathname).toBe(`/items/${itemId}`)
    await user.click(screen.getByRole('link', { name: '관리 완료 기록하기' }))
    fireEvent.change(screen.getByLabelText(/관리 날짜/, { selector: 'input' }), { target: { value: '2026-11-08' } })
    await user.type(screen.getByLabelText('메모 (선택)'), '통합 저장 메모')
    await user.click(screen.getByRole('button', { name: '기록 저장' }))
    await waitFor(() => expect(window.location.pathname).toBe(`/items/${itemId}`))
    expect(stored('histories')).toHaveLength(2)
    const historyId = stored('histories').find(record => record.id !== initialId).id
    const recordLink = screen.getAllByRole('link', { name: '기록 수정 →' }).find(link => link.getAttribute('href') === `/history/${historyId}/edit`)
    await user.click(recordLink)
    fireEvent.change(screen.getByLabelText(/관리 날짜/, { selector: 'input' }), { target: { value: '2026-10-01' } })
    await user.click(screen.getByRole('button', { name: '저장하기' }))
    await waitFor(() => expect(window.location.pathname).toBe('/history'))
    expect(stored('histories').find(record => record.id === historyId).managedAt).toBe('2026-10-01')
    const editLink = screen.getAllByRole('link', { name: /기록 수정$/ }).find(link => link.getAttribute('href') === `/history/${historyId}/edit`)
    await user.click(editLink)
    await user.click(screen.getByRole('button', { name: '기록 삭제' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: '취소' }))
    expect(stored('histories')).toHaveLength(2)
    await user.click(screen.getByRole('button', { name: '기록 삭제' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: '기록 삭제' }))
    await waitFor(() => expect(window.location.pathname).toBe('/history'))
    expect(stored('histories')).toHaveLength(1)
    await user.click(screen.getByRole('link', { name: '관리 항목 보기' }))
    await user.click(screen.getByRole('button', { name: '관리 대상 삭제' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: '항목과 기록 삭제' }))
    await waitFor(() => expect(window.location.pathname).toBe('/items'))
    expect(stored('items')).toHaveLength(0)
    expect(stored('histories')).toHaveLength(0)
    expect(screen.getByRole('heading', { name: '아직 관리 대상이 없어요' })).toBeTruthy()
  })

  test('직접 공간·항목 추가 → 새 Provider에서 복원 → 기본 항목 수정·연결 해제', async () => {
    seed()
    const user = userEvent.setup()
    start('/items/new')
    await user.click(await screen.findByRole('button', { name: '직접 공간 추가' }))
    await user.type(screen.getByLabelText('새 공간 이름'), '베란다')
    await user.click(screen.getByRole('button', { name: '이 공간 선택' }))
    await user.type(screen.getByLabelText(/관리 항목 이름/), '베란다 바닥 청소')
    await user.click(screen.getByRole('button', { name: '저장하기' }))
    await waitFor(() => expect(stored('items')).toHaveLength(2))
    expect(stored('spaces').some(space => space.name === '베란다')).toBe(true)
    cleanup()
    start('/items/item-test/edit')
    const name = await screen.findByLabelText(/관리 항목 이름/)
    await user.clear(name)
    await user.type(name, '이름만 수정')
    await user.click(screen.getByRole('button', { name: '수정 내용 저장' }))
    await waitFor(() => expect(window.location.pathname).toBe('/items/item-test'))
    expect(stored('items')[0].templateId).toBe('kitchen-sink-drain')
    await user.click(screen.getByRole('link', { name: '수정' }))
    await user.click(screen.getByRole('button', { name: '직접 등록 항목으로 전환' }))
    await user.click(screen.getByRole('button', { name: '수정 내용 저장' }))
    await waitFor(() => expect(window.location.pathname).toBe('/items/item-test'))
    expect(stored('items')[0].templateId).toBeNull()
    expect(stored('histories')).toHaveLength(1)
  })

  test('실제 저장 오류는 입력을 유지하고 재시도하며 빠른 중복 제출은 한 건만 저장한다', async () => {
    seed()
    const user = userEvent.setup()
    start('/items/item-test/record')
    fireEvent.change(await screen.findByLabelText(/관리 날짜/, { selector: 'input' }), { target: { value: '2026-11-08' } })
    await user.type(screen.getByLabelText('메모 (선택)'), '실패 뒤 유지')
    const original = Storage.prototype.setItem
    const mock = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (key, value) {
      if (key === 'homeguide:histories') throw new Error('QuotaExceededError')
      return original.call(this, key, value)
    })
    await user.click(screen.getByRole('button', { name: '기록 저장' }))
    expect(screen.getByRole('heading', { name: '저장하지 못했어요' })).toBeTruthy()
    expect(screen.getByLabelText('메모 (선택)').value).toBe('실패 뒤 유지')
    expect(stored('histories')).toHaveLength(1)
    mock.mockRestore()
    const form = document.getElementById('record-form-preview')
    act(() => { fireEvent.submit(form); fireEvent.submit(form) })
    await waitFor(() => expect(window.location.pathname).toBe('/items/item-test'))
    expect(stored('histories')).toHaveLength(2)
    expect(stored('histories').at(-1).memo).toBe('실패 뒤 유지')
  })

  test('최신·마지막 기록 삭제와 자정 경과가 상태에 반영된다', async () => {
    const data = seed()
    const user = userEvent.setup()
    start('/items/item-test')
    expect(await screen.findByText('1일 남음', { exact: false })).toBeTruthy()
    act(() => { vi.setSystemTime(new Date(2026, 10, 9, 12)); window.dispatchEvent(new Event('focus')) })
    expect(screen.getByText('오늘 관리')).toBeTruthy()
    await user.click(screen.getByRole('link', { name: '기록 수정 →' }))
    await user.click(screen.getByRole('button', { name: '기록 삭제' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: '기록 삭제' }))
    await waitFor(() => expect(window.location.pathname).toBe('/history'))
    expect(stored('histories')).toHaveLength(0)
    expect(stored('items')).toEqual(data.items)
    cleanup()
    start('/items/item-test')
    expect(await screen.findByText('아직 관리 기록이 없어요')).toBeTruthy()
    expect(screen.getByText('미설정')).toBeTruthy()
  })

  test('미완료 접근 차단·완료 사용자 시작 주소 이동·404·없는 ID', async () => {
    start('/items')
    await screen.findByRole('button', { name: '시작하기' })
    expect(window.location.pathname).toBe('/')
    cleanup(); seed(); start('/')
    await waitFor(() => expect(window.location.pathname).toBe('/home'))
    cleanup(); start('/items/missing/edit')
    expect(await screen.findByRole('heading', { name: '수정할 관리 대상을 찾을 수 없어요' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: '수정 내용 저장' })).toBeNull()
    cleanup(); start('/not-a-page')
    expect(await screen.findByRole('heading', { name: '페이지를 찾을 수 없어요' })).toBeTruthy()
  })

  test('손상된 저장소는 원본을 보존하고 수정 후 재시도할 수 있다', async () => {
    seed()
    localStorage.setItem('homeguide:items', '{broken')
    start('/home')
    const user = userEvent.setup()
    expect(await screen.findByRole('heading', { name: '데이터를 불러오지 못했어요' })).toBeTruthy()
    expect(localStorage.getItem('homeguide:items')).toBe('{broken')
    seed()
    await user.click(screen.getByRole('button', { name: '다시 불러오기' }))
    expect(await screen.findByRole('link', { name: '통합 시험 항목' })).toBeTruthy()
  })

  test('자정 타이머가 다음 날로 전환하고 해제 시 타이머를 정리한다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 8, 23, 59, 59))
    const hook = renderHook(() => useCalendarToday())
    expect(hook.result.current).toBe('2026-11-08')
    act(() => vi.advanceTimersByTime(1000))
    expect(hook.result.current).toBe('2026-11-09')
    hook.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  test('미래 날짜 입력은 화면에서 오류를 표시하고 저장하지 않는다', async () => {
    seed()
    start('/items/item-test/record')
    const user = userEvent.setup()
    const date = await screen.findByLabelText(/관리 날짜/, { selector: 'input' })
    fireEvent.change(date, { target: { value: '2099-01-01' } })
    await user.click(screen.getByRole('button', { name: '기록 저장' }))
    expect(date.getAttribute('aria-invalid')).toBe('true')
    expect(stored('histories')).toHaveLength(1)
    expect(window.location.pathname).toBe('/items/item-test/record')
  })

})
