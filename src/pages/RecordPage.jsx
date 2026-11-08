import { Link, useParams, useSearchParams } from 'react-router-dom'
import RecordForm from '../features/histories/components/RecordForm.jsx'
import { useDataViews } from '../contexts/useDataViews.js'

export default function RecordPage() {
  const { getRecordForm } = useDataViews()
  const { itemId } = useParams()
  const [params] = useSearchParams()
  const preview = import.meta.env.DEV ? params.get('preview') : null
  const data = getRecordForm(itemId, preview)
  if (!data) return <section className="flex flex-col gap-4">
    <h2 className="font-heading text-title font-bold">기록할 관리 대상을 찾을 수 없어요</h2>
    <Link to="/items" className="text-label font-bold text-primary underline">관리 대상 목록으로</Link>
  </section>
  return <RecordForm key={`${itemId}-${preview || ''}`} {...data} preview={preview} />
}
