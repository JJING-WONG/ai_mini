import { Link } from 'react-router-dom'
import summaryNext from '../../../assets/icons/home-summary-next.svg'
import unsetNext from '../../../assets/icons/home-unset-next.svg'

const categories = [
  { status: 'overdue', label: '지연' },
  { status: 'today', label: '오늘' },
  { status: 'upcoming', label: '임박' },
  { status: 'scheduled', label: '예정' },
]

export default function HomeStatusSummary({ items, compact = false }) {
  // 이미 지정된 표시 상태의 개수만 집계합니다. 일정 판별 로직은 포함하지 않습니다.
  const counts = categories.map(category => ({ ...category, count: items.filter(item => item.status === category.status).length }))
  const unsetCount = items.filter(item => item.status === 'unset').length

  if (compact) {
    return <section aria-label="관리 상태 요약" className="rounded-card bg-soft p-4 text-body text-primary">{counts.map(({ label, count }) => `${label} ${count}`).join('  ·  ')}</section>
  }

  return (
    <section aria-labelledby="home-summary-title" className="rounded-3xl bg-summary p-4 text-summary-foreground">
      <div className="flex items-center justify-between gap-3">
        <h2 id="home-summary-title" className="text-[11.5px] font-semibold">관리 상태 요약</h2>
        <Link to="/items" className="flex items-center gap-2 text-[11px] font-medium hover:underline">전체 보기<img src={summaryNext} alt="" className="[transform:scaleY(-1)]" /></Link>
      </div>
      <dl className="mt-3 grid grid-cols-4 gap-1">
        {counts.map(({ status, label, count }) => <div key={status} className="flex min-w-0 flex-col items-center rounded-card bg-primary/60 px-1 py-2.5">
          <dt className="order-2 mt-1 text-[10.5px] leading-[15.75px]">{label}</dt>
          <dd className="order-1 text-xl leading-5 font-bold text-canvas">{count}</dd>
        </div>)}
      </dl>
      <Link to="/items" className="mt-2.5 flex min-h-[34px] items-center justify-between gap-3 rounded-card bg-summary-deep/50 px-3 py-2 text-[11px] leading-[13.2px] hover:bg-primary">
        <span>일정이 아직 없는 항목 {unsetCount}개</span><img src={unsetNext} alt="" className="shrink-0 [transform:scaleY(-1)]" />
      </Link>
    </section>
  )
}
