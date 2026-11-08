import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatManagedDate, useDataViews } from '../../../contexts/useDataViews.js'
import { validateHistoryInput, previewHistorySchedule } from '../../../services/historyService.js'
import { calculateMaintenance } from '../../../services/maintenanceService.js'
import ConfirmDialog from '../../../components/ui/ConfirmDialog.jsx'
import FormFeedback from '../../../components/ui/FormFeedback.jsx'
import { collectFormErrors } from '../../../utils/formFeedback.js'
import TextField from '../../../components/ui/TextField.jsx'
import TextArea from '../../../components/ui/TextArea.jsx'
import StatusBadge from '../../../components/ui/StatusBadge.jsx'
import RecordDateField from './RecordDateField.jsx'
import { getRecordDateExample } from '../data/historyFormPreview.js'
import spaceIcon from '../../../assets/icons/record-space.svg'
import deleteIcon from '../../../assets/icons/record-delete.svg'

export default function RecordForm({ item, initial, record, editing = false, preview }) {
  const navigate = useNavigate()
  const { addHistory, updateHistory, deleteHistory, today } = useDataViews()
  const submitting = useRef(false)
  const isPreview = Boolean(import.meta.env.DEV && (item.id.startsWith('preview-') || record?.id.startsWith('preview-') || ['default', 'filled', 'past', 'scheduled', 'errors', 'save-error'].includes(preview)))
  const [operationError, setOperationError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')
  const [values, setValues] = useState(preview === 'errors' ? { ...initial, managedAt: '2099-01-01' } : initial)
  const [notice, setNotice] = useState('')
  const [errors, setErrors] = useState(preview === 'errors' ? { managedAt: '오늘 또는 과거의 올바른 관리 날짜를 입력해 주세요.' } : {})
  const [failed, setFailed] = useState(preview === 'save-error')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const formRef = useRef(null)
  const predicted = !isPreview ? previewHistorySchedule(item, item.histories, values.managedAt, { historyId: editing ? record.id : undefined, today }) : null
  const dateExample = isPreview ? getRecordDateExample(item.id, values.managedAt) : predicted?.scheduleError || (predicted ? `마지막 관리일 ${formatManagedDate(predicted.lastManagedDate)} · ${predicted.nextDueDate ? `다음 관리일 ${formatManagedDate(predicted.nextDueDate)}` : '주기가 없어 다음 관리일은 미설정이에요.'}` : null)
  const afterDelete = editing && !isPreview ? calculateMaintenance(item, item.histories.filter(current => current.id !== record.id), today) : null

  function update(field, value) {
    setValues(current => ({ ...current, [field]: value }))
    setNotice('')
    setOperationError('')
    setErrors({})
    setFailed(false)
  }

  function submit(event) {
    event.preventDefault()
    if (submitting.current) return
    const nextErrors = { ...collectFormErrors(event.currentTarget, { managedAt: '오늘 또는 과거의 올바른 관리 날짜를 입력해 주세요.' }), ...validateHistoryInput(values) }
    setErrors(nextErrors)
    setNotice('')
    setOperationError('')
    if (Object.keys(nextErrors).length) { event.currentTarget.elements.namedItem(Object.keys(nextErrors)[0])?.focus(); return }
    if (preview === 'save-error') { setSaveMessage(''); setFailed(true); return }
    if (isPreview) { setNotice('디자인 미리보기입니다. 기록은 저장되지 않았어요.'); return }
    submitting.current = true
    const result = editing ? updateHistory(record.id, values) : addHistory(item.id, values)
    if (result.ok) navigate(editing ? '/history' : `/items/${result.itemId}`, { replace: true })
    else { submitting.current = false; setSaveMessage(result.error); setFailed(true) }
  }

  function confirmDelete() {
    if (submitting.current) return
    if (isPreview) { setDeleteOpen(false); setNotice('디자인 미리보기입니다. 기록은 삭제되지 않았어요.'); return }
    submitting.current = true
    const result = deleteHistory(record.id)
    setDeleteOpen(false)
    if (result.ok) navigate('/history', { replace: true })
    else { submitting.current = false; setOperationError(result.error) }
  }

  return <div className="flex flex-col gap-4">
    <section aria-labelledby="record-item-title" className="rounded-3xl border border-divider p-5">
      <p className="flex items-center gap-2 text-caption text-subtle">
        {item.spaceName === '주방' && <span aria-hidden="true" className="flex size-6 items-center justify-center rounded-lg bg-[#f8eddd]"><img src={spaceIcon} alt="" className="[transform:scaleY(-1)]" /></span>}
        {item.spaceName}
      </p>
      <h2 id="record-item-title" className="mt-2 font-heading text-xl leading-[27.5px] font-bold">{item.name}</h2>
      {editing ? <div className="mt-1.5 text-[11.5px] text-subtle">
        <p>기존 관리 날짜 · {record.managedAtLabel}</p>
        {record.type === 'initial' && <p className="mt-1 text-primary">초기 관리일 기록</p>}
      </div> : <>
        <div className="mt-2.5 flex flex-wrap items-center gap-2"><StatusBadge status={item.status} detail={item.statusDetail} /><span className="text-[11.5px] text-subtle">{item.intervalLabel}</span></div>
      </>}
        <aside className="mt-4 rounded-card bg-soft px-3.5 py-3 text-caption leading-[19.5px] text-summary-deep">
          <h3 className="text-[11px] font-semibold text-summary">{editing ? '수정 후 예상 일정' : '기록하면 일정이 이렇게 바뀌어요'}</h3>
          <p className="mt-1">{dateExample || (item.intervalLabel === '미설정' ? '관리 주기가 없어 다음 관리일을 계산할 수 없어요. 기록은 남길 수 있어요.' : '가장 최근의 관리일과 관리 주기를 기준으로 다음 관리일이 정해져요.')}</p>
        </aside>
    </section>

    <FormFeedback errors={errors} failed={failed} simulated={isPreview} message={saveMessage} formId="record-form-preview" onDismiss={() => { setFailed(false); formRef.current.elements.namedItem('managedAt').focus() }} />
    <form ref={formRef} id="record-form-preview" noValidate onSubmit={submit} className="flex flex-col gap-4 rounded-3xl border border-divider p-4">
      <RecordDateField error={errors.managedAt} value={values.managedAt} onChange={event => update('managedAt', event.target.value)} />
      <TextField error={errors.productUsed} name="productUsed" label="사용 제품 · 부품 (선택)" placeholder="사용한 제품이나 부품을 적어주세요" hint={editing ? undefined : '예: 통세척 세제, AA 건전지 4개'} value={values.productUsed} onChange={event => update('productUsed', event.target.value)} />
      <TextArea error={errors.memo} name="memo" label="메모 (선택)" placeholder="어떻게 관리했는지 간단히 남겨보세요" value={values.memo} onChange={event => update('memo', event.target.value)} />
    </form>
    {editing && <button type="button" onClick={() => setDeleteOpen(true)} className="flex min-h-14 w-full items-center justify-center gap-1.5 rounded-card border border-[#fbc9c0] px-5 py-3.5 text-base font-semibold text-danger">
      <img src={deleteIcon} alt="" className="[transform:scaleY(-1)]" />기록 삭제
    </button>}
    {editing && <ConfirmDialog open={deleteOpen} title="이 기록을 삭제할까요?" subtitle={`${item.name} · ${record.managedAtLabel}`} confirmLabel="기록 삭제" onCancel={() => setDeleteOpen(false)} onConfirm={confirmDelete}>
      {afterDelete ? `이 기록을 삭제하면 ${afterDelete.lastManagedDate ? `마지막 관리일은 ${formatManagedDate(afterDelete.lastManagedDate)}` : '남은 기록이 없어 마지막 관리일은 미설정'}이에요. ${afterDelete.nextDueDate ? `다음 관리일은 ${formatManagedDate(afterDelete.nextDueDate)}이에요.` : '다음 관리일은 미설정이 돼요.'} 삭제 후에는 되돌릴 수 없어요.` : '이 기록을 삭제하면 남은 기록의 최근 관리일로 다음 관리일을 다시 계산해요. 모든 기록이 없어지면 일정은 미설정이 돼요.'}
    </ConfirmDialog>}
    {operationError && <p role="alert" className="text-body text-danger">{operationError}</p>}
    <p role="status" aria-live="polite" className="text-caption text-primary">{notice}</p>
  </div>
}
