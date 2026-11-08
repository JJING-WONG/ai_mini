import StatusBadge from '../../../components/ui/StatusBadge.jsx'
import { Link } from 'react-router-dom'

export default function ItemListCard({ item }) {
  return (
    <article className="relative overflow-hidden rounded-card border border-divider bg-canvas p-[17px]">
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#dad6d0]" />
      <div className="flex min-w-0 items-start gap-3 pl-1">
        <Link to={`/items/${item.id}`} className="min-w-0 flex-1 rounded-sm pt-1">
          <h3 className="text-[15px] leading-[18px] font-semibold">{item.name}</h3>
          <p className="mt-1 text-caption leading-[14.4px] text-subtle">{item.nextDueDate ? `다음 관리일 · ${item.nextManagedLabel}` : '주기 또는 마지막 관리일을 설정해 주세요.'}</p>
        </Link>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-[#dad6d0] bg-[#f3f0ea] px-[9px] py-[3px] text-[11px] leading-[17.6px] font-semibold text-[#56524b]">
            <span aria-hidden="true" className="size-[5px] rounded-full bg-current" /><StatusBadge status={item.status} />
          </span>
          <Link to={`/items/${item.id}/record`} aria-label={`${item.name} 관리 완료 기록하기`} className="rounded-input bg-primary px-3 py-1.5 text-caption leading-[14.4px] font-semibold text-canvas hover:brightness-95">관리 완료</Link>
        </div>
      </div>
    </article>
  )
}
