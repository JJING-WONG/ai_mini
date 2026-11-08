import { Link } from 'react-router-dom'
import Card from '../../../components/ui/Card.jsx'
import emptyHistoryIcon from '../../../assets/icons/detail-empty-history.svg'

export default function ItemHistoryList({ histories }) {
  return (
    <section aria-labelledby="item-history-title">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <h2 id="item-history-title" className="text-label font-bold">최근 관리 기록</h2>
        <span className="text-[11px] text-nav-muted">{histories.length}건</span>
      </div>
      {!histories.length ? <div className="flex flex-col items-center rounded-card border border-dashed border-line px-[17px] py-6 text-center">
        <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-input bg-detail-soft"><img src={emptyHistoryIcon} alt="" className="[transform:scaleY(-1)]" /></span>
        <p className="mt-2.5 text-[12.5px] font-semibold">아직 관리 기록이 없어요</p>
        <p className="mt-1 text-[11.5px] leading-[18.688px] text-subtle">관리 완료를 기록하면 다음 관리일이 자동으로 계산돼요.</p>
      </div> : <ol className="flex flex-col gap-3">
        {histories.map(record => <li key={record.id}><article aria-labelledby={`record-${record.id}`}><Card>
          <p className="text-caption text-primary">{record.type === 'initial' ? '초기 관리일' : '관리 완료 기록'}</p>
          <h3 id={`record-${record.id}`} className="text-label font-bold">{record.managedAtLabel}</h3>
          {record.type === 'initial' && <p className="text-body text-muted">등록할 때 입력한 기존 관리일이에요.</p>}
          {record.productUsed && <p className="text-body text-muted">사용 제품 · {record.productUsed}</p>}
          {record.memo && <p className="text-body whitespace-pre-line text-muted">메모 · {record.memo}</p>}
          <Link to={`/history/${record.id}/edit`} className="text-label font-bold text-primary hover:underline">기록 수정 →</Link>
        </Card></article></li>)}
      </ol>}
    </section>
  )
}
