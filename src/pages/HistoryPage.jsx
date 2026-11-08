import { useDataViews, createHistoryGroups } from '../contexts/useDataViews.js'
import { Link, useSearchParams } from 'react-router-dom'
import { getHistoryListPreview } from '../features/histories/data/historyListPreview.js'
import HistoryEntryCard from '../features/histories/components/HistoryEntryCard.jsx'
import HistoryEmptyState from '../features/histories/components/HistoryEmptyState.jsx'
import allArrow from '../assets/icons/history-all-arrow.svg'

export default function HistoryPage() {
  const [params] = useSearchParams()
  const { itemViews } = useDataViews()
  const preview = import.meta.env.DEV ? params.get('preview') : null
  const { count, compact, groups } = ['default', 'single', 'empty'].includes(preview) ? getHistoryListPreview(preview) : createHistoryGroups(itemViews)
  return <section>
    <header>
      <p className="text-[11.5px] font-medium text-subtle">관리한 날의 기록</p>
      <h1 className="mt-1 font-heading text-2xl leading-9 font-bold tracking-[-0.6px]">히스토리</h1>
      <p className="mt-1 text-caption text-subtle">지금까지 {count}건의 관리를 기록했어요</p>
    </header>
    {count ? <div className="mt-6 flex flex-col gap-6">
      {groups.map(group => <section key={group.date} aria-labelledby={`history-date-${group.date}`}>
        <div className="mb-2 flex items-center gap-2">
          <h2 id={`history-date-${group.date}`} className="text-[12.5px] font-bold"><time dateTime={group.date} aria-label={group.accessibleLabel}>{group.label}</time></h2>
          <span className="rounded-full bg-detail-soft px-1.5 py-0.5 text-[10.5px] font-semibold text-subtle">{group.entries.length}건</span>
        </div>
        <ol className="flex flex-col gap-3">{group.entries.map(({ item, record }) => <li key={record.id}><HistoryEntryCard item={item} record={record} compact={compact} /></li>)}</ol>
      </section>)}
    </div> : <div className="mt-7"><HistoryEmptyState /></div>}
    <Link to="/items" className="mt-7 mb-2 flex min-h-14 items-center justify-center gap-1.5 rounded-card border border-line px-5 py-3.5 text-base font-semibold hover:bg-detail-soft">관리 대상 보러 가기<img src={allArrow} alt="" className="shrink-0 [transform:scaleY(-1)]" /></Link>
  </section>
}
