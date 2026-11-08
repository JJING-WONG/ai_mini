import OnboardingIcon from './OnboardingIcon.jsx'

export default function OnboardingProgress({ step, spaceIndex, spaceCount, onBack }) {
  const active = ['spaces', 'items', 'cycles'].indexOf(step)
  return <div>
    <div className="flex items-center justify-between">
      <button type="button" onClick={onBack} aria-label="이전 단계로" className="flex size-9 items-center justify-center rounded-full text-muted hover:bg-soft"><OnboardingIcon name="back" /></button>
      <p aria-live="polite" className="text-[11.5px] font-medium text-nav-muted">{step === 'items' ? `${spaceIndex + 1} / ${spaceCount} 공간` : `${active + 1} / 3 단계`}</p>
    </div>
    <ol aria-label="온보딩 진행 단계" className="mt-4 grid grid-cols-3 gap-1.5">
      {['공간 선택', '관리 항목', '주기 설정'].map((label, index) => <li key={label} aria-current={active === index ? 'step' : undefined}>
        <div aria-hidden="true" className={`h-1.5 rounded-full ${index <= active ? 'bg-primary' : 'bg-line'}`} />
        <span className={`mt-1.5 block text-[10.5px] ${active === index ? 'font-bold text-primary' : 'text-nav-muted'}`}>{label}</span>
      </li>)}
    </ol>
  </div>
}
