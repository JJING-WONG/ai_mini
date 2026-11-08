import { Link, useParams, useSearchParams } from 'react-router-dom'
import AppLayout from '../../../components/layout/AppLayout.jsx'
import { useDataViews } from '../../../contexts/useDataViews.js'
import editIcon from '../../../assets/icons/detail-edit.svg'
import completeIcon from '../../../assets/icons/detail-complete.svg'

export default function ItemDetailLayout() {
  const { getItem } = useDataViews()
  const { itemId } = useParams()
  const [params] = useSearchParams()
  const item = getItem(itemId, params.get('preview'))
  const recordQuery = import.meta.env.DEV && params.get('preview') === 'scheduled' ? '?preview=scheduled' : ''
  return <AppLayout title={item?.spaceName || '관리 항목 상세'} description={item ? '관리 항목 상세' : undefined} backTo="/items"
    headerAction={item && <Link to={`/items/${item.id}/edit`} className="inline-flex items-center gap-1 rounded-full border border-line px-[13px] py-px text-caption font-semibold text-muted hover:bg-soft"><img src={editIcon} alt="" className="[transform:scaleY(-1)]" />수정</Link>}
    bottomAction={item && <Link to={`/items/${item.id}/record${recordQuery}`} className="flex min-h-14 w-full items-center justify-center gap-1.5 rounded-card bg-primary px-5 py-3.5 text-base font-semibold text-canvas hover:brightness-95"><img src={completeIcon} alt="" className="[transform:scaleY(-1)]" />관리 완료 기록하기</Link>}
  />
}
