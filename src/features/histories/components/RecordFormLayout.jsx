import { useParams, useSearchParams } from 'react-router-dom'
import AppLayout from '../../../components/layout/AppLayout.jsx'
import Button from '../../../components/ui/Button.jsx'
import { useDataViews } from '../../../contexts/useDataViews.js'
import saveIcon from '../../../assets/icons/record-save.svg'

export default function RecordFormLayout({ editing = false }) {
  const { getHistoryForm, getRecordForm } = useDataViews()
  const { itemId, historyId } = useParams()
  const [params] = useSearchParams()
  const preview = import.meta.env.DEV ? params.get('preview') : null
  const detailQuery = preview === 'scheduled' ? '?preview=scheduled' : ''
  const data = editing ? getHistoryForm(historyId) : getRecordForm(itemId, preview)
  return <AppLayout title={editing ? '관리 기록 수정' : '관리 완료 기록'}
    description={editing ? '관리 날짜를 고치면 일정을 다시 계산해요' : '관리한 내용을 남겨주세요'}
    backTo={editing ? '/history' : data ? `/items/${data.item.id}${detailQuery}` : '/items'}
    bottomAction={data ? <Button type="submit" form="record-form-preview">
      {!editing && <img src={saveIcon} alt="" className="[transform:scaleY(-1)]" />}{editing ? '저장하기' : '기록 저장'}
    </Button> : null}
  />
}
