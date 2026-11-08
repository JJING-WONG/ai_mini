import { useRef, useState } from 'react'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { defaultItems } from '../data/defaultItems.js'
import Card from '../components/ui/Card.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { useDataViews } from '../contexts/useDataViews.js'
import ItemHistoryList from '../features/items/components/ItemHistoryList.jsx'
import kitchenIcon from '../assets/icons/detail-kitchen.svg'
import infoIcon from '../assets/icons/detail-info.svg'
import deleteIcon from '../assets/icons/detail-delete.svg'

function InfoRow({ label, value, muted = false }) {
  return <div className="flex items-start justify-between gap-4 py-2.5">
    <dt className="shrink-0 text-caption text-subtle">{label}</dt>
    <dd className={`min-w-0 text-right text-[12.5px] font-medium whitespace-pre-line ${muted ? 'text-nav-muted' : 'text-ink'}`}>{value}</dd>
  </div>
}

export default function ItemDetailPage() {
  const navigate = useNavigate()
  const deleting = useRef(false)
  const { getItem, deleteItem } = useDataViews()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const { itemId } = useParams()
  const [params] = useSearchParams()
  const item = getItem(itemId, params.get('preview'))

  if (!item) return <section className="flex flex-col gap-4">
    <h2 className="font-heading text-title font-bold">관리 대상을 찾을 수 없어요</h2>
    <p className="text-body text-muted">목록에서 관리할 항목을 다시 선택해 주세요.</p>
    <Link to="/items" className="text-label font-bold text-primary underline">관리 대상 목록으로</Link>
  </section>

  function confirmDelete() {
    if (deleting.current) return
    if (import.meta.env.DEV && (itemId.startsWith('preview-') || params.has('preview'))) {
      setDeleteOpen(false)
      setNotice('디자인 미리보기입니다. 항목과 기록은 삭제되지 않았어요.')
      return
    }
    deleting.current = true
    const result = deleteItem(itemId)
    setDeleteOpen(false)
    if (result.ok) navigate('/items', { replace: true })
    else { deleting.current = false; setNotice(result.error) }
  }

  const template = defaultItems.find(template => template.id === item.templateId)
  return (
    <div className="flex flex-col gap-4">
      <section aria-labelledby="item-detail-title" className="rounded-3xl border border-divider p-5">
        <div className="flex items-center gap-2 text-caption text-subtle">
          {item.spaceName === '주방' && <span aria-hidden="true" className="flex size-6 items-center justify-center rounded-lg bg-[#f8eddd]"><img src={kitchenIcon} alt="" className="[transform:scaleY(-1)]" /></span>}
          <span>{item.spaceName}</span>
        </div>
        <h2 id="item-detail-title" className="mt-2.5 font-heading text-[23px] leading-[31.625px] font-bold">{item.name}</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={item.status} detail={item.statusDetail} />
          {item.status === 'unset' && !item.scheduleError && <span className="text-caption text-subtle">관리 일정이 아직 없어요</span>}
        </div>
        <dl className="mt-4 divide-y divide-divider border-t border-divider">
          <InfoRow label="관리 주기" value={item.intervalLabel} muted={item.intervalLabel === '미설정'} />
          <InfoRow label="마지막 관리일" value={item.lastManagedLabel} muted={item.lastManagedLabel === '아직 없음'} />
          <InfoRow label="다음 관리일" value={item.nextManagedLabel} muted={item.status === 'unset'} />
        </dl>
        {item.scheduleError && <p role="alert" className="mt-3 text-caption text-danger">{item.scheduleError}</p>}
        {item.status === 'unset' && !item.scheduleError && <div className="mt-1.5 rounded-card bg-detail-soft px-3.5 py-3 text-[11.5px] leading-[18.688px] text-muted">
          <p>주기 또는 마지막 관리일이 없어 다음 관리일을 만들지 않았어요.</p>
          <Link to={`/items/${item.id}/edit`} className="mt-1.5 inline-block font-semibold text-primary underline">주기 설정하기</Link>
        </div>}
      </section>

      <section aria-labelledby="item-product-title" className="rounded-3xl border border-divider p-5">
        <h2 id="item-product-title" className="text-[12.5px] font-bold text-muted">제품 정보</h2>
        <dl className="mt-2.5">
          <InfoRow label="모델명" value={item.modelName || '입력되지 않음'} />
          <InfoRow label="규격" value={item.specification || '입력되지 않음'} />
          <InfoRow label="이미지" value={item.image ? '등록됨' : '등록되지 않음'} muted={!item.image} />
        </dl>
        {item.image && <img src={item.image} alt={`${item.name} 제품 사진`} className="mt-3 max-h-60 w-full rounded-input object-contain" />}
        {item.memo && <div className="mt-2 border-t border-divider pt-3"><h3 className="text-caption text-subtle">메모</h3><p className="mt-1 text-body whitespace-pre-line">{item.memo}</p></div>}
      </section>

      {template ? <section aria-labelledby="item-guide-title" className="rounded-3xl border border-info-line bg-info-soft p-5 text-info-ink">
        <h2 id="item-guide-title" className="flex items-center gap-1.5 text-[12.5px] font-bold"><img src={infoIcon} alt="" className="[transform:scaleY(-1)]" />관리가 필요한 이유</h2>
        <p className="mt-2 text-[12.5px] leading-[20.313px]">{template.description}</p>
        <div className="mt-2.5 border-t border-info-line pt-2 text-[11px] leading-relaxed">
          <p className="font-semibold">{template.intervalSourceType === 'official' ? `공식 안내 · 권장 ${template.recommendedIntervalDays}일` : template.intervalSourceType === 'suggested' ? `서비스 참고값 · ${template.recommendedIntervalDays}일` : '공통 권장 주기 없음'}</p>
          <p className="mt-1">{template.intervalNote}</p>
          {template.sourceUrl && <a href={template.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block font-semibold underline">{template.sourceName} 참고 자료 열기 ↗</a>}
        </div>
      </section> : <Card><p className="text-caption text-muted">직접 등록한 항목은 기본 콘텐츠의 설명이나 출처가 없어도 사용할 수 있어요.</p></Card>}

      <ConfirmDialog open={deleteOpen} title="관리 대상을 삭제할까요?" subtitle={item.name} confirmLabel="항목과 기록 삭제" onCancel={() => setDeleteOpen(false)} onConfirm={confirmDelete}>
        이 항목과 연결된 관리 기록 {item.histories.length}건이 함께 삭제돼요. 삭제 후에는 되돌릴 수 없어요.
      </ConfirmDialog>
      <p role="alert" className="text-caption text-danger">{notice}</p>
      <div className="mt-2"><ItemHistoryList histories={item.histories} /></div>
      <div className="mt-2">
        <button type="button" onClick={() => setDeleteOpen(true)} className="flex min-h-12 w-full items-center justify-center gap-1.5 rounded-card border border-[#fbc9c0] px-[17px] py-1 text-[15px] font-semibold text-danger">
          <img src={deleteIcon} alt="" className="[transform:scaleY(-1)]" />관리 대상 삭제
        </button>
        <p className="mt-2 text-center text-[11px] text-nav-muted">삭제하면 이 항목의 관리 기록도 함께 사라져요</p>
      </div>
    </div>
  )
}
