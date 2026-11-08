import { useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import TextField from '../components/ui/TextField.jsx'
import SelectField from '../components/ui/SelectField.jsx'
import TextArea from '../components/ui/TextArea.jsx'
import { defaultSpaces } from '../data/defaultSpaces.js'
import { defaultItems } from '../data/defaultItems.js'
import { useDataViews } from '../contexts/useDataViews.js'
import ItemImagePicker from '../features/items/components/ItemImagePicker.jsx'
import FormFeedback from '../components/ui/FormFeedback.jsx'
import { collectFormErrors } from '../utils/formFeedback.js'
import { validateItemInput } from '../services/itemService.js'
import noticeIcon from '../assets/icons/form-notice.svg'

export default function ItemFormPage() {
  const { getItemForm } = useDataViews()
  const { itemId } = useParams()
  const [params] = useSearchParams()
  const preview = import.meta.env.DEV ? params.get('preview') : null
  const initial = getItemForm(itemId, preview)
  if (!initial) return <section className="flex flex-col gap-4">
    <h2 className="font-heading text-title font-bold">수정할 관리 대상을 찾을 수 없어요</h2>
    <Link to="/items" className="text-label font-bold text-primary underline">관리 대상 목록으로</Link>
  </section>
  return <ItemForm key={`${itemId || 'new'}-${preview || ''}`} initial={initial} itemId={itemId} editing={Boolean(itemId)} preview={preview} />
}

const messages = { spaceId: '소속 공간을 선택해 주세요.', name: '관리 항목 이름을 입력해 주세요.', interval: '양의 정수 일수를 입력하거나 비워 주세요.' }

function ItemForm({ initial, itemId, editing, preview }) {
  const navigate = useNavigate()
  const isPreview = Boolean(import.meta.env.DEV && (itemId?.startsWith('preview-') || ['errors', 'save-error', 'template', 'filled', 'default'].includes(preview)))
  const { spaces: storedSpaces, addItem, updateItem } = useDataViews()
  const [values, setValues] = useState(preview === 'errors' ? { ...initial, spaceId: '', name: '', interval: '0' } : preview === 'save-error' ? { ...initial, name: initial.name || '베란다 바닥 청소', interval: initial.interval || '14' } : initial)
  const [notice, setNotice] = useState('')
  const [errors, setErrors] = useState(preview === 'errors' ? messages : {})
  const [failed, setFailed] = useState(preview === 'save-error')
  const [saveMessage, setSaveMessage] = useState('')
  const [draftSpaces, setDraftSpaces] = useState([])
  const [addingSpace, setAddingSpace] = useState(false)
  const [spaceName, setSpaceName] = useState('')
  const [spaceError, setSpaceError] = useState('')
  const imageBusy = useRef(false)
  const submitting = useRef(false)
  const formRef = useRef(null)
  const templates = defaultItems.filter(item => item.spaceId === values.spaceId)
  const selectedTemplate = defaultItems.find(item => item.id === values.templateId)
  const spaces = [...defaultSpaces, ...storedSpaces.filter(space => !defaultSpaces.some(base => base.id === space.id)), ...draftSpaces]
  if (initial.spaceId === 'preview-balcony' && !spaces.some(space => space.id === initial.spaceId)) spaces.push({ id: 'preview-balcony', name: '베란다' })

  function update(field, value) {
    setValues(current => ({ ...current, [field]: value }))
    setNotice('')
    setErrors({})
    setFailed(false)
  }

  function selectSpace(spaceId) {
    setValues(current => ({ ...current, spaceId, ...(!editing ? { templateId: '' } : {}) }))
    setNotice('')
    setErrors({})
    setFailed(false)
  }

  function selectTemplate(templateId) {
    const template = templates.find(item => item.id === templateId)
    setValues(current => ({ ...current, templateId, ...(template ? { name: template.name, interval: template.recommendedIntervalDays == null ? '' : String(template.recommendedIntervalDays) } : {}) }))
    setNotice('')
    setErrors({})
    setFailed(false)
  }

  function addSpace() {
    const name = spaceName.trim()
    if (!name) { setSpaceError('공간 이름을 입력해 주세요.'); return }
    const existing = spaces.find(space => space.name === name)
    const space = existing || { id: `space-${crypto.randomUUID()}`, name }
    if (!existing) setDraftSpaces(current => [...current, space])
    selectSpace(space.id)
    setSpaceName('')
    setAddingSpace(false)
  }

  function submit(event) {
    event.preventDefault()
    if (submitting.current) return
    if (imageBusy.current) { setNotice('이미지 확인이 끝난 뒤 저장해 주세요.'); return }
    const nextErrors = { ...collectFormErrors(event.currentTarget, messages), ...validateItemInput(values) }
    setErrors(nextErrors)
    setNotice('')
    if (Object.keys(nextErrors).length) {
      event.currentTarget.elements.namedItem(Object.keys(nextErrors)[0])?.focus()
      return
    }
    if (preview === 'save-error') { setSaveMessage(''); setFailed(true); return }
    if (isPreview) { setNotice('디자인 미리보기입니다. 입력 내용은 저장되지 않았어요.'); return }
    submitting.current = true
    const selectedSpace = spaces.find(space => space.id === values.spaceId)
    const result = editing ? updateItem(itemId, values, selectedSpace) : addItem(values, selectedSpace)
    if (result.ok) navigate(`/items/${result.itemId}`, { replace: true })
    else { submitting.current = false; setSaveMessage(result.error); setFailed(true) }
  }

  return (
    <div className="flex flex-col gap-4">
      <FormFeedback errors={errors} failed={failed} simulated={isPreview} message={saveMessage} formId="item-form-preview" onDismiss={() => { setFailed(false); formRef.current.elements.namedItem('name').focus() }} />
      <form ref={formRef} id="item-form-preview" noValidate onSubmit={submit} className="flex flex-col gap-4 rounded-3xl border border-divider p-4">
        <SelectField name="spaceId" error={errors.spaceId} label="소속 공간" required value={values.spaceId} onChange={event => selectSpace(event.target.value)}>
          <option value="" disabled>공간 선택</option>
          {spaces.map(space => <option key={space.id} value={space.id}>{space.name}</option>)}
        </SelectField>
        <button type="button" onClick={() => setAddingSpace(current => !current)} className="self-start text-caption font-semibold text-primary underline">직접 공간 추가</button>
        {addingSpace && <div className="flex flex-col gap-2 rounded-input bg-detail-soft p-3">
          <TextField label="새 공간 이름" value={spaceName} error={spaceError} onChange={event => { setSpaceName(event.target.value); setSpaceError('') }} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addSpace() } }} placeholder="예: 베란다" />
          <button type="button" onClick={addSpace} className="min-h-10 rounded-input border border-line bg-surface text-label font-bold text-primary">이 공간 선택</button>
          <p className="text-caption text-muted">항목을 저장할 때 공간도 함께 등록돼요.</p>
        </div>}
        {!editing && <SelectField label="기본 관리 항목에서 고르기 (선택)" value={values.templateId} onChange={event => selectTemplate(event.target.value)} hint="추천 항목을 고르면 이름과 권장 주기가 자동으로 채워져요.">
          <option value="">직접 입력할게요</option>
          {templates.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
        </SelectField>}
        {editing && selectedTemplate && <div className="rounded-input bg-soft p-3 text-caption text-primary">
          <p>기본 항목 연결 · {selectedTemplate.name}</p>
          <p className="mt-1">이름을 바꿔도 관리 안내 연결은 유지돼요. 다른 관리 대상이라면 직접 등록 항목으로 전환해 주세요.</p>
          <button type="button" onClick={() => update('templateId', '')} className="mt-2 min-h-10 font-semibold underline">직접 등록 항목으로 전환</button>
        </div>}
        {editing && !values.templateId && initial.templateId && <button type="button" onClick={() => update('templateId', initial.templateId)} className="min-h-10 self-start text-caption text-primary underline">기존 기본 항목 연결로 되돌리기</button>}
        <TextField name="name" error={errors.name} label="관리 항목 이름" required placeholder="예: 세탁조 세척" value={values.name} onChange={event => update('name', event.target.value)} />
        <TextField name="interval" error={errors.interval} label="관리 주기 (선택)" type="number" min="1" step="1" inputMode="numeric" suffix="일" placeholder="예: 30" value={values.interval} onChange={event => update('interval', event.target.value)}
          hint={editing && selectedTemplate?.recommendedIntervalDays ? `기본 권장 주기는 ${selectedTemplate.recommendedIntervalDays}일이에요. 내 생활에 맞게 바꿔도 괜찮아요.` : '비워두면 주기 미설정으로 등록되고, 나중에 설정할 수 있어요.'} />
        {selectedTemplate && <div className="rounded-input bg-soft px-3 py-2 text-caption text-primary">
          <p className="font-medium">{selectedTemplate.intervalSourceType === 'official' ? '공식 안내 기반' : selectedTemplate.intervalSourceType === 'suggested' ? '서비스 참고값' : '공통 권장 주기 없음'}</p>
          <p className="mt-1">{selectedTemplate.intervalNote}</p>
        </div>}
        <TextField label="모델명 (선택)" placeholder="예: LG 디오스 300L" value={values.modelName} onChange={event => update('modelName', event.target.value)} />
        <TextField label="규격 (선택)" placeholder="예: 필터 2개 / 30cm" value={values.specification} onChange={event => update('specification', event.target.value)} />
        <ItemImagePicker value={values.image ?? null} onChange={image => update('image', image)} onBusyChange={busy => { imageBusy.current = busy }} />
        <TextArea label="메모 (선택)" placeholder="청소 방법이나 주의할 점을 적어두세요." value={values.memo} onChange={event => update('memo', event.target.value)} />
      </form>
      <aside className="flex items-start gap-2.5 rounded-card bg-detail-soft px-3.5 py-3 text-[12.5px] leading-[20.313px] text-muted">
        <img src={noticeIcon} alt="" className="mt-1 shrink-0 [transform:scaleY(-1)]" />
        <p><strong className="font-semibold">* 표시는 필수 항목이에요.</strong> 마지막 관리일은 관리 완료 기록을 남기면 자동으로 채워져요.</p>
      </aside>
      <p role="status" aria-live="polite" className="text-caption text-primary">{notice}</p>
    </div>
  )
}
