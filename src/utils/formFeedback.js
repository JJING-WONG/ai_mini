import { getLocalToday } from './date.js'

// 화면 입력 오류 표시만 담당합니다. 저장 및 관리 일정 계산은 하지 않습니다.
export function collectFormErrors(form, messages) {
  const errors = {}
  for (const [name, message] of Object.entries(messages)) {
    const input = form.elements.namedItem(name)
    if (input && (!input.validity.valid || (input.required && !input.value.trim()))) errors[name] = message
  }
  form.elements.namedItem(Object.keys(errors)[0])?.focus()
  return errors
}

export function localInputDate() { return getLocalToday() }
