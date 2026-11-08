import { Link, useParams, useSearchParams } from 'react-router-dom'
import RecordForm from '../features/histories/components/RecordForm.jsx'
import { useDataViews } from '../contexts/useDataViews.js'

export default function HistoryEditPage() {
  const { getHistoryForm } = useDataViews()
  const { historyId } = useParams()
  const [params] = useSearchParams()
  const preview = import.meta.env.DEV ? params.get('preview') : null
  const data = getHistoryForm(historyId)
  if (!data) return <section className="flex flex-col gap-4">
    <h2 className="font-heading text-title font-bold">수정할 관리 기록을 찾을 수 없어요</h2>
    <Link to="/history" className="text-label font-bold text-primary underline">히스토리 목록으로</Link>
  </section>
  return <RecordForm key={`${historyId}-${preview || ''}`} {...data} preview={preview} editing />
}
