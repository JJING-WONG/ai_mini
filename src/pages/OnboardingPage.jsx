import { useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout.jsx'
import Button from '../components/ui/Button.jsx'
import OnboardingWelcome from '../features/onboarding/components/OnboardingWelcome.jsx'
import OnboardingProgress from '../features/onboarding/components/OnboardingProgress.jsx'
import OnboardingSpaceStep from '../features/onboarding/components/OnboardingSpaceStep.jsx'
import OnboardingItemsStep from '../features/onboarding/components/OnboardingItemsStep.jsx'
import OnboardingCycleStep from '../features/onboarding/components/OnboardingCycleStep.jsx'
import OnboardingIcon from '../features/onboarding/components/OnboardingIcon.jsx'
import { useAppData } from '../contexts/AppDataContext.js'
import { createOnboardingDraft, restoreOnboarding, validateOnboarding } from '../services/onboardingService.js'
import { createOnboardingPreview, createOnboardingSelection } from '../features/onboarding/data/onboardingPreview.js'

export default function OnboardingPage() {
  const [params] = useSearchParams()
  const { onboarding } = useAppData()
  const requested = import.meta.env.DEV ? params.get('preview') : null
  const preview = ['spaces', 'items', 'cycles', 'custom', 'welcome'].includes(requested) ? requested : null
  const restored = preview ? { wizard: { ...createOnboardingPreview(preview), customItems: createOnboardingPreview(preview).selectedItems.filter(item => item.templateId === null) }, warning: '' } : restoreOnboarding(onboarding)
  return <OnboardingWizard key={preview || 'saved'} preview={preview} initial={restored.wizard} warning={restored.warning} />
}

function OnboardingWizard({ preview, initial, warning }) {
  const { saveResource, completeOnboarding } = useAppData()
  const [wizard, setWizardState] = useState(initial)
  const wizardRef = useRef(initial)
  const submitting = useRef(false)
  const formRef = useRef(null)
  const [notice, setNotice] = useState(warning)
  const [draftError, setDraftError] = useState('')
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const selectedSpaces = wizard.spaces.filter(space => wizard.selectedSpaceIds.includes(space.id))
  const selectedItems = wizard.selectedItems.filter(item => wizard.selectedSpaceIds.includes(item.spaceId))
  const currentSpace = selectedSpaces[wizard.spaceIndex]
  const currentCount = selectedItems.filter(item => item.spaceId === currentSpace?.id).length
  const lastSpace = wizard.spaceIndex === selectedSpaces.length - 1

  function persist(next) {
    if (preview) return
    const result = saveResource('onboarding', createOnboardingDraft(next))
    setDraftError(result.ok ? '' : result.error)
  }

  function setWizard(update) {
    const next = update(wizardRef.current)
    wizardRef.current = next
    setWizardState(next)
    setNotice('')
    setErrors({})
    persist(next)
  }

  function finish(event) {
    event.preventDefault()
    if (submitting.current) return
    const result = validateOnboarding(wizardRef.current)
    setErrors(result.fields)
    if (result.summary) {
      setNotice(result.summary)
      requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus())
      return
    }
    if (!formRef.current.checkValidity()) { formRef.current.reportValidity(); return }
    if (preview) { setNotice('디자인 미리보기입니다. 설정은 저장되지 않았어요.'); return }
    submitting.current = true
    const saved = completeOnboarding(wizardRef.current)
    if (saved.ok) navigate('/home', { replace: true })
    else { setNotice(saved.error); submitting.current = false }
  }

  function back() {
    setWizard(current => {
      if (current.step === 'spaces') return { ...current, step: 'welcome' }
      if (current.step === 'cycles') return { ...current, step: 'items', spaceIndex: Math.max(0, selectedSpaces.length - 1) }
      if (current.spaceIndex > 0) return { ...current, spaceIndex: current.spaceIndex - 1 }
      return { ...current, step: 'spaces', spaceIndex: 0 }
    })
  }

  function toggleSpace(id) {
    setWizard(current => ({ ...current, selectedSpaceIds: current.selectedSpaceIds.includes(id) ? current.selectedSpaceIds.filter(value => value !== id) : [...current.selectedSpaceIds, id] }))
  }

  function addSpace(name) {
    const existing = wizard.spaces.find(space => space.name === name)
    const space = existing || { id: `space-${crypto.randomUUID()}`, name }
    setWizard(current => ({ ...current, spaces: existing ? current.spaces : [...current.spaces, space], selectedSpaceIds: [...new Set([...current.selectedSpaceIds, space.id])] }))
  }

  function toggleItem(choice) {
    setWizard(current => {
      const exists = current.selectedItems.some(item => choice.key ? item.key === choice.key : item.templateId === choice.id)
      return { ...current, selectedItems: exists ? current.selectedItems.filter(item => choice.key ? item.key !== choice.key : item.templateId !== choice.id) : [...current.selectedItems, choice.key ? { ...choice } : createOnboardingSelection(choice)] }
    })
  }

  function addItem(name) {
    const item = { key: `choice-${crypto.randomUUID()}`, templateId: null, spaceId: currentSpace.id, name, interval: '', managedAt: '', unknownDate: true }
    setWizard(current => ({ ...current, customItems: [...current.customItems, item], selectedItems: [...current.selectedItems, item] }))
  }

  function updateItem(key, patch) {
    setWizard(current => ({ ...current, selectedItems: current.selectedItems.map(item => item.key === key ? { ...item, ...patch } : item), customItems: current.customItems.map(item => item.key === key ? { ...item, ...patch } : item) }))
  }

  let bottomAction = null
  if (wizard.step === 'spaces') bottomAction = <Button disabled={!selectedSpaces.length} onClick={() => setWizard(current => ({ ...current, step: 'items', spaceIndex: 0 }))}>다음<OnboardingIcon name="stepNext" /></Button>
  if (wizard.step === 'items') bottomAction = <div className="w-full"><p aria-live="polite" className="mb-2 text-center text-[11.5px] text-subtle">{currentSpace.name} 항목 {currentCount}개 선택됨</p><div className="flex gap-2"><div className="w-24 shrink-0"><Button variant="secondary" onClick={back}>이전</Button></div><Button disabled={lastSpace && !selectedItems.length} onClick={() => setWizard(current => lastSpace ? { ...current, step: 'cycles' } : { ...current, spaceIndex: current.spaceIndex + 1 })}>{lastSpace ? '주기 설정하기' : currentCount ? '다음 공간' : '건너뛰기'}<OnboardingIcon name="stepNext" /></Button></div>{lastSpace && !selectedItems.length && <p className="mt-2 text-center text-caption text-muted">전체 공간에서 최소 1개 항목을 선택해 주세요.</p>}</div>
  if (wizard.step === 'cycles') bottomAction = <div className="w-full"><p className="mb-2 text-center text-[11.5px] text-subtle">총 {selectedItems.length}개 항목 · 주기와 관리일은 선택 입력이에요</p><Button type="submit" form="onboarding-cycles">설정 완료<OnboardingIcon name="complete" /></Button></div>

  return <AppLayout scrollKey={`${wizard.step}-${wizard.spaceIndex}`} bottomAction={bottomAction}>
    {notice && <p role="alert" className="mb-4 rounded-card bg-soft p-4 text-body text-danger">{notice}</p>}
    {draftError && <div role="alert" className="mb-4 rounded-card bg-soft p-4 text-body text-danger"><p>진행 내용을 저장하지 못했어요. 새로고침하면 최신 입력이 사라질 수 있어요.</p><Button variant="secondary" onClick={() => persist(wizardRef.current)}>진행 내용 다시 저장</Button></div>}
    {wizard.step === 'welcome' ? <OnboardingWelcome onStart={() => setWizard(current => ({ ...current, step: 'spaces' }))} /> : <>
      <OnboardingProgress step={wizard.step} spaceIndex={wizard.spaceIndex} spaceCount={selectedSpaces.length} onBack={back} />
      {wizard.step === 'spaces' && <OnboardingSpaceStep spaces={wizard.spaces} selectedIds={wizard.selectedSpaceIds} onToggle={toggleSpace} onAdd={addSpace} />}
      {wizard.step === 'items' && <OnboardingItemsStep key={currentSpace.id} space={currentSpace} selectedItems={selectedItems} customItems={wizard.customItems} onToggle={toggleItem} onAdd={addItem} />}
      {wizard.step === 'cycles' && <form ref={formRef} id="onboarding-cycles" noValidate onSubmit={finish}><OnboardingCycleStep spaces={selectedSpaces} items={selectedItems} onUpdate={updateItem} errors={errors} /></form>}
    </>}
  </AppLayout>
}
