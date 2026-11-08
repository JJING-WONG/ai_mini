import { useState } from 'react'
import InlineAddForm from './InlineAddForm.jsx'
import OnboardingIcon from './OnboardingIcon.jsx'

const descriptions = { kitchen: '조리 · 설거지 공간', bathroom: '샤워 · 세면 공간', laundry: '세탁기 · 건조기', living: '거실 · 침실', entrance: '신발장 · 출입문' }
const iconNames = { kitchen: 'kitchen', bathroom: 'bathroom', laundry: 'laundry', living: 'living', entrance: 'entrance' }

export default function OnboardingSpaceStep({ spaces, selectedIds, onToggle, onAdd }) {
  const [adding, setAdding] = useState(false)
  return <section className="mt-7">
    <h1 className="font-heading text-2xl leading-[33px] font-bold tracking-[-0.6px]">우리 집에는<br />어떤 공간이 있나요?</h1>
    <p className="mt-2.5 text-body leading-[21.125px] text-muted">해당하는 공간을 모두 선택해 주세요.<br />선택한 공간에서 관리할 항목을 찾아드려요.</p>
    <div className="mt-6 grid grid-cols-2 gap-2.5">
      {spaces.map(space => {
        const selected = selectedIds.includes(space.id)
        return <label key={space.id} className={`relative min-w-0 cursor-pointer rounded-card border-2 p-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary ${selected ? 'border-primary bg-soft' : 'border-divider bg-canvas hover:border-line'}`}>
          <input type="checkbox" checked={selected} onChange={() => onToggle(space.id)} aria-label={space.name} className="sr-only" />
          <span aria-hidden="true" className={`absolute top-3 right-3 flex size-5 items-center justify-center rounded-full border ${selected ? 'border-primary bg-primary text-white' : 'border-line bg-surface text-white'}`}><OnboardingIcon name={selected ? 'spaceChecked' : 'spaceUnchecked'} /></span>
          <span aria-hidden="true" className={`flex size-10 items-center justify-center rounded-input ${selected ? 'bg-primary text-white' : 'bg-detail-soft text-muted'}`}><OnboardingIcon name={iconNames[space.id] || 'brand'} /></span>
          <span className="mt-3 block text-label leading-[16.8px] font-semibold">{space.name}</span>
          <span className="mt-0.5 block text-[11px] leading-[13.2px] text-subtle">{descriptions[space.id] || '직접 추가한 공간'}</span>
        </label>
      })}
    </div>
    <div className="mt-4">{adding ? <InlineAddForm label="공간 이름" onCancel={() => setAdding(false)} onAdd={name => { onAdd(name); setAdding(false) }} /> : <button type="button" onClick={() => setAdding(true)} className="flex min-h-[50px] w-full items-center justify-center gap-1.5 rounded-card border border-dashed border-line text-body font-medium text-muted hover:bg-detail-soft"><OnboardingIcon name="add" />직접 공간 추가</button>}</div>
  </section>
}
