import { Link } from 'react-router-dom'
import emptyIcon from '../../../assets/icons/history-empty.svg'

export default function HistoryEmptyState() {
  return <section aria-labelledby="history-empty-title" className="flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-10 text-center">
    <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-card bg-detail-soft"><img src={emptyIcon} alt="" className="[transform:scaleY(-1)]" /></span>
    <h2 id="history-empty-title" className="mt-4 font-heading text-base font-bold">아직 기록이 없어요</h2>
    <p className="mt-1.5 text-body leading-[21.125px] text-subtle">관리 완료를 기록하면 날짜별로 모아 볼 수 있어요.<br />최근 관리일과 주기로 다음 관리일을 계산해요.</p>
    <Link to="/items" className="mt-5 flex min-h-14 w-full max-w-60 items-center justify-center rounded-card bg-primary px-5 py-3.5 text-base font-semibold text-canvas hover:brightness-95">관리할 항목 보러 가기</Link>
  </section>
}
