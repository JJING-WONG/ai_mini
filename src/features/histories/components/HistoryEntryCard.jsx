import { Link } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import completedIcon from '../../../assets/icons/history-completed.svg'
import nextIcon from '../../../assets/icons/history-entry-next.svg'

export default function HistoryEntryCard({ item, record, compact = false }) {
  const editTo = `/history/${record.id}/edit`
  const itemTo = `/items/${item.id}${import.meta.env.DEV && item.id === 'preview-hood' ? '?preview=scheduled' : ''}`
  const initial = record.type === 'initial'

  if (compact) return <article>
    <Link to={editTo} aria-label={`${item.name} ${record.managedAtLabel} 기록 수정`} className="flex min-h-[76px] items-start gap-3 rounded-card border border-divider bg-canvas p-[17px] hover:bg-detail-soft">
      <span aria-hidden="true" className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-input bg-soft"><img src={completedIcon} alt="" className="[transform:scaleY(-1)]" /></span>
      <div className="min-w-0 flex-1">
        <h3 className="text-[13.5px] leading-[20.25px] font-semibold">{item.name}</h3>
        <p className="mt-0.5 text-[11px] text-subtle">{item.spaceName}</p>
      </div>
      <img src={nextIcon} alt="" className="mt-1 shrink-0 [transform:scaleY(-1)]" />
    </Link>
    <Link to={itemTo} className="mt-2 inline-block rounded-sm text-caption text-primary underline">관련 관리 항목 보기</Link>
  </article>

  return <article aria-labelledby={`history-${record.id}`}><Card>
    <p className="text-caption text-primary">{initial ? '초기 관리일' : '관리 완료'} · {item.spaceName}</p>
    <h3 id={`history-${record.id}`} className="text-label font-bold"><Link to={editTo} className="rounded-sm hover:underline">{item.name}</Link></h3>
    {initial && <p className="text-body text-muted">등록할 때 입력한 기존 관리일이에요.</p>}
    {record.productUsed && <p className="text-body text-muted">사용 제품 · {record.productUsed}</p>}
    {record.memo && <p className="text-body whitespace-pre-line text-muted">메모 · {record.memo}</p>}
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <Link to={editTo} aria-label={`${item.name} ${record.managedAtLabel} 기록 수정`} className="text-label font-bold text-primary hover:underline">기록 수정 →</Link>
      <Link to={itemTo} className="text-caption text-primary underline">관리 항목 보기</Link>
    </div>
  </Card></article>
}
