import { localInputDate } from '../../../utils/formFeedback.js'
import { useId, useRef } from 'react'
import { defaultItems } from '../../../data/defaultItems.js'
import TextField from '../../../components/ui/TextField.jsx'
import OnboardingIcon from './OnboardingIcon.jsx'
import { onboardingAssets } from '../data/onboardingAssets.js'

function CycleCard({ item, spaceName, onUpdate, error = {} }) {
  const dateId = useId()
  const titleId = useId()
  const dateRef = useRef(null)
  const template = defaultItems.find(template => template.id === item.templateId)

  function adjust(delta) {
    const current = Number(item.interval)
    const base = Number.isFinite(current) ? current : 0
    onUpdate({ interval: String(Math.max(1, Math.trunc(base) + delta)) })
  }

  function openCalendar() {
    dateRef.current?.focus()
    try { dateRef.current?.showPicker?.() } catch { /* 직접 입력도 가능합니다. */ }
  }

  return <section aria-labelledby={titleId} className="rounded-card border border-divider bg-canvas p-4">
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 id={titleId} className="text-label font-semibold">{item.name}</h3><p className="mt-1 text-caption text-subtle">{spaceName}</p></div><span className="shrink-0 rounded-full bg-info-soft px-2 py-0.5 text-[11px] font-semibold text-info-ink">{template?.recommendedIntervalDays ? `${template.intervalSourceType === 'official' ? '공식' : '참고'} ${template.recommendedIntervalDays}일` : '직접 설정'}</span></div>
    <div className="mt-4 flex items-start gap-2">
      <button type="button" onClick={() => adjust(-1)} aria-label={`${item.name} 주기 줄이기`} className="mt-[29px] flex h-12 w-9 shrink-0 items-center justify-center rounded-input border border-line text-muted hover:bg-soft"><OnboardingIcon name="minus" /></button>
      <div className="min-w-0 flex-1"><TextField error={error.interval} label="관리 주기" type="number" inputMode="numeric" min="1" step="1" suffix="일" placeholder="미설정" value={item.interval} onChange={event => onUpdate({ interval: event.target.value })} /></div>
      <button type="button" onClick={() => adjust(1)} aria-label={`${item.name} 주기 늘리기`} className="mt-[29px] flex h-12 w-9 shrink-0 items-center justify-center rounded-input border border-line text-muted hover:bg-soft"><OnboardingIcon name="plus" /></button>
    </div>
    <div aria-label={`${item.name} 주기 빠른 선택`} className="mt-2 flex flex-wrap gap-1">
      {[7, 14, 30, 90, 180].map(days => <button key={days} type="button" aria-pressed={item.interval === String(days)} onClick={() => onUpdate({ interval: String(days) })} className={`rounded-full border px-2 py-1 text-[11px] ${item.interval === String(days) ? 'border-primary bg-soft font-semibold text-primary' : 'border-line text-muted hover:bg-soft'}`}>{days}일</button>)}
      <button type="button" onClick={() => onUpdate({ interval: '' })} className="rounded-full px-2 py-1 text-[11px] text-muted underline">비우기</button>
    </div>
    <div className="mt-4 border-t border-divider pt-3">
      <div className="flex flex-wrap items-center justify-between gap-2"><label htmlFor={dateId} className="text-caption font-semibold">마지막 관리일</label><label className="inline-flex cursor-pointer items-center gap-1 text-[11px] text-primary focus-within:outline-2 focus-within:outline-primary"><input type="checkbox" checked={item.unknownDate} onChange={event => onUpdate({ unknownDate: event.target.checked })} className="sr-only" /><span aria-hidden="true" className={`flex size-3.5 items-center justify-center rounded border ${item.unknownDate ? 'border-primary bg-primary text-white' : 'border-line bg-surface text-white'}`}><OnboardingIcon name="smallCheck" /></span>기억나지 않아요</label></div>
      <div className="relative mt-2"><input ref={dateRef} id={dateId} type="date" max={localInputDate()} aria-invalid={error.managedAt ? true : undefined} value={item.unknownDate ? '' : item.managedAt} disabled={item.unknownDate} onChange={event => onUpdate({ managedAt: event.target.value })} aria-describedby={[`${dateId}-hint`, error.managedAt && `${dateId}-error`].filter(Boolean).join(' ')} className={`h-12 min-w-0 w-full rounded-input border ${error.managedAt ? 'border-danger' : 'border-line'} bg-surface pr-12 pl-3 text-body disabled:bg-detail-soft disabled:text-nav-muted [&::-webkit-calendar-picker-indicator]:hidden`} /><button type="button" onClick={openCalendar} disabled={item.unknownDate} aria-label={`${item.name} 마지막 관리일 달력 열기`} className="absolute inset-y-1 right-1 flex w-10 items-center justify-center rounded-input disabled:opacity-40"><img src={onboardingAssets.calendar.src} alt="" /></button></div>
      {error.managedAt && <p id={`${dateId}-error`} role="alert" className="mt-1 text-caption text-danger">{error.managedAt}</p>}
      <p id={`${dateId}-hint`} className="mt-1.5 text-[10.5px] leading-[17px] text-subtle">{item.unknownDate || !item.managedAt ? '마지막 관리일 없이 등록돼요. 다음 관리일은 계산하지 않아요.' : '오늘 또는 과거 날짜로 입력해 주세요.'}</p>
    </div>
  </section>
}

export default function OnboardingCycleStep({ spaces, items, onUpdate, errors = {} }) {
  return <section className="mt-7">
    <h1 className="font-heading text-2xl leading-[33px] font-bold tracking-[-0.6px]">얼마나 자주<br />관리할까요?</h1>
    <p className="mt-2.5 text-body leading-[21.125px] text-muted">권장 주기는 참고값이에요. 내 생활에 맞게 바꿔도 괜찮아요.<br />지금 정하지 못한 항목은 나중에 설정할 수 있어요.</p>
    <div className="mt-6 flex flex-col gap-6">{spaces.map(space => {
      const spaceItems = items.filter(item => item.spaceId === space.id)
      if (!spaceItems.length) return null
      const icon = space.id === 'kitchen' ? 'kitchenSmall' : space.id === 'bathroom' ? 'cycleBathroom' : null
      return <section key={space.id} aria-labelledby={`cycle-space-${space.id}`}><h2 id={`cycle-space-${space.id}`} className="mb-2 flex items-center gap-1.5 text-[12.5px] font-bold text-muted">{icon && <OnboardingIcon name={icon} />}{space.name}<span className="text-[11px] font-normal text-subtle">{spaceItems.length}개</span></h2><div className="flex flex-col gap-3">{spaceItems.map(item => <CycleCard key={item.key} item={item} error={errors[item.key]} spaceName={space.name} onUpdate={patch => onUpdate(item.key, patch)} />)}</div></section>
    })}</div>
  </section>
}
