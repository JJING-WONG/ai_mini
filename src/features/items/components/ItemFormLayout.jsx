import { useParams } from 'react-router-dom'
import AppLayout from '../../../components/layout/AppLayout.jsx'
import Button from '../../../components/ui/Button.jsx'
import { useDataViews } from '../../../contexts/useDataViews.js'

export default function ItemFormLayout() {
  const { getItemForm } = useDataViews()
  const { itemId } = useParams()
  const editing = Boolean(itemId)
  const valid = !editing || Boolean(getItemForm(itemId))
  return <AppLayout title={editing ? '관리 대상 수정' : '관리 대상 추가'}
    description={editing ? '내용을 고치고 저장해 주세요' : '우리 집에 맞는 관리 항목을 등록해요'}
    backTo={editing && valid ? `/items/${itemId}` : '/items'}
    bottomAction={valid ? <Button type="submit" form="item-form-preview">{editing ? '수정 내용 저장' : '저장하기'}</Button> : null}
  />
}
