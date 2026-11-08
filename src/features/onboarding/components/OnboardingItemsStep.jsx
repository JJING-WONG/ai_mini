import { useState } from 'react'
import { defaultItems } from '../../../data/defaultItems.js'
import InlineAddForm from './InlineAddForm.jsx'
import OnboardingIcon from './OnboardingIcon.jsx'

export default function OnboardingItemsStep({ space, selectedItems, customItems, onToggle, onAdd }) {
  const [adding, setAdding] = useState(false)
  const choices = [...defaultItems.filter(item => item.spaceId === space.id), ...customItems.filter(item => item.spaceId === space.id)]
  return <section className="mt-6">
    <p className="flex items-center gap-2 text-[12.5px] font-semibold text-[#37281d]">{space.id === 'bathroom' && <span className="flex size-7 items-center justify-center rounded-lg bg-[#f8eddd]"><OnboardingIcon name="bathroomSmall" /></span>}{space.name}</p>
    <h1 className="mt-3 font-heading text-2xl leading-[33px] font-bold tracking-[-0.6px]">{space.name}에서<br />이런 관리를 챙겨요</h1>
    <p className="mt-2.5 text-body leading-[21.125px] text-muted">평소엔 잘 모르고 지나치는 항목들이에요.<br />지금 관리할 수 있는 것만 골라 주세요.</p>
    <aside className="mt-4 flex items-start gap-2.5 rounded-card bg-info-soft px-3.5 py-3 text-caption leading-[19.5px] text-info-ink"><OnboardingIcon name="info" /><p><strong>권장 주기</strong>는 참고값이에요. 다음 단계에서 내 생활에 맞게 바꿀 수 있어요.</p></aside>
    <div className="mt-4 flex flex-col gap-2.5">
      {choices.map(item => {
        const selected = selectedItems.some(selection => selection.templateId === item.id || selection.key === item.key)
        return <article key={item.key || item.id} className={`rounded-card border-2 p-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary ${selected ? 'border-primary bg-soft' : 'border-divider bg-canvas'}`}>
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={selected} onChange={() => onToggle(item)} aria-label={item.name} className="sr-only" />
            <span aria-hidden="true" className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border ${selected ? 'border-primary bg-primary text-white' : 'border-line bg-surface text-white'}`}><OnboardingIcon name={selected ? 'itemChecked' : 'itemUnchecked'} /></span>
            <span className="min-w-0"><span className="block text-label font-semibold">{item.name}</span><span className="mt-1 block text-caption leading-[19.5px] text-muted">{item.description || '직접 추가한 관리 항목이에요.'}</span><span className="mt-2 inline-flex items-center gap-1 rounded-full bg-info-soft px-2 py-0.5 text-[11px] font-semibold text-info-ink"><OnboardingIcon name="clock" />{item.recommendedIntervalDays ? `권장 ${item.recommendedIntervalDays}일` : '직접 설정'}</span></span>
          </label>
          <div className="mt-1 ml-8 text-[10.5px] leading-[17px] text-subtle"><p>{item.intervalSourceType === 'official' ? '공식 안내' : item.intervalSourceType === 'suggested' ? '서비스 참고값' : '공통 주기 없음'}{item.sourceName ? ` · ${item.sourceName}` : ''}</p>{item.intervalNote && <p>{item.intervalNote}</p>}{item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="inline-block text-primary underline">참고 자료 열기 ↗</a>}</div>
        </article>
      })}
      {!choices.length && <p className="rounded-card border border-dashed border-line p-5 text-body text-muted">이 공간에 맞는 기본 항목이 없어요. 관리할 항목을 직접 추가해 주세요.</p>}
    </div>
    <div className="mt-4">{adding ? <InlineAddForm label="관리 항목 이름" onCancel={() => setAdding(false)} onAdd={name => { onAdd(name); setAdding(false) }} /> : <button type="button" onClick={() => setAdding(true)} className="flex min-h-[50px] w-full items-center justify-center gap-1.5 rounded-card border border-dashed border-line text-body font-medium text-muted hover:bg-detail-soft"><OnboardingIcon name="add" />직접 항목 추가</button>}</div>
  </section>
}
