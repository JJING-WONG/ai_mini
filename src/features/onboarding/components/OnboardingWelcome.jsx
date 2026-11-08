import Button from '../../../components/ui/Button.jsx'
import { onboardingAssets } from '../data/onboardingAssets.js'
import OnboardingIcon from './OnboardingIcon.jsx'

const benefits = [
  { icon: 'discover', title: '놓친 관리 항목 발견', body: '공간별로 꼭 챙겨야 할 항목을 알려드려요' },
  { icon: 'welcomeCycle', title: '주기만 정하면 끝', body: '권장 주기를 참고해 내 생활에 맞게 조정' },
  { icon: 'welcomeHistory', title: '기록하면 일정 자동 계산', body: '관리한 날을 남기면 다음 날짜가 알아서 갱신' },
]

export default function OnboardingWelcome({ onStart }) {
  return <section>
    <p className="flex items-center gap-2 font-heading text-[15px] font-bold tracking-[-0.375px]"><span className="flex size-8 items-center justify-center rounded-input bg-primary text-canvas"><OnboardingIcon name="brand" /></span>자취방 설명서</p>
    <div className="mt-10">
      <p className="inline-flex items-center gap-1.5 rounded-full bg-[#f8eddd] px-3 py-1 text-[11.5px] font-semibold text-[#37281d]"><OnboardingIcon name="welcomeBadge" />첫 자취를 시작한 당신에게</p>
      <h1 className="mt-4 font-heading text-[30px] leading-[40.8px] font-bold tracking-[-0.75px]">우리 집,<br />무엇부터 관리해야 할까요?</h1>
      <p className="mt-3 text-label leading-[22.75px] text-muted">놓치기 쉬운 집안 관리 항목을 찾아드려요.<br />발견하고, 주기를 정하고, 기록하면 끝.</p>
    </div>
    <div className="mt-7 overflow-hidden rounded-3xl border border-divider bg-detail-soft"><img src={onboardingAssets.room.src} alt="햇빛이 들어오는 자취방의 침대와 책상, 주방 공간" className="aspect-[333/210] w-full object-cover" /></div>
    <ul className="mt-6 flex flex-col gap-3">
      {benefits.map(benefit => <li key={benefit.icon} className="flex items-start gap-3"><span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-input bg-soft text-primary"><OnboardingIcon name={benefit.icon} /></span><div className="min-w-0"><h2 className="text-[13.5px] font-semibold">{benefit.title}</h2><p className="mt-0.5 text-caption leading-[19.5px] text-subtle">{benefit.body}</p></div></li>)}
    </ul>
    <div className="mt-8 [&>button]:min-h-14 [&>button]:text-base"><Button onClick={onStart}>시작하기<OnboardingIcon name="next" /></Button></div>
    <p className="mt-3 text-center text-[11px] text-nav-muted">로그인 없이 바로 시작할 수 있어요</p>
  </section>
}
