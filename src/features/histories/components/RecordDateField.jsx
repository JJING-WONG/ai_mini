import { useId, useRef } from 'react'
import Field from '../../../components/ui/Field.jsx'
import { localInputDate } from '../../../utils/formFeedback.js'
import calendarIcon from '../../../assets/icons/record-calendar.svg'

export default function RecordDateField({ value, onChange, error }) {
  const id = useId()
  const inputRef = useRef(null)

  function openPicker() {
    inputRef.current?.focus()
    try { inputRef.current?.showPicker?.() } catch { /* 지원하지 않는 환경에서는 직접 날짜를 입력합니다. */ }
  }

  return <Field id={id} label="관리 날짜" required error={error} hint="오늘 또는 과거 날짜만 선택할 수 있어요.">
    <div className="relative">
      <input ref={inputRef} id={id} name="managedAt" type="date" max={localInputDate()} aria-invalid={error ? true : undefined} required value={value} onChange={onChange} aria-describedby={`${id}-message`}
        className={`h-12 min-w-0 w-full appearance-none rounded-input border ${error ? 'border-danger' : 'border-line'} bg-surface pr-12 pl-4 text-body text-ink [&::-webkit-calendar-picker-indicator]:hidden`} />
      <button type="button" onClick={openPicker} aria-label="관리 날짜 달력 열기" className="absolute inset-y-1 right-1 flex w-10 items-center justify-center rounded-input hover:bg-soft">
        <img src={calendarIcon} alt="" />
      </button>
    </div>
  </Field>
}
