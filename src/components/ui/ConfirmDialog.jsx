import { useEffect, useId, useRef } from 'react'
import Button from './Button.jsx'

export default function ConfirmDialog({ open, title, subtitle, children, confirmLabel, onCancel, onConfirm }) {
  const dialogRef = useRef(null)
  const cancelRef = useRef(null)
  const id = useId()
  useEffect(() => {
    if (!open) return
    const dialog = dialogRef.current
    const previousFocus = document.activeElement
    dialog.showModal()
    cancelRef.current?.focus()
    return () => {
      dialog.close()
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [open])
  if (!open) return null
  return <dialog ref={dialogRef} aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} onCancel={event => { event.preventDefault(); onCancel() }} className="m-auto max-h-[calc(100dvh-40px)] w-[335px] max-w-[calc(100vw-40px)] overflow-y-auto rounded-3xl border border-line bg-canvas p-5 text-ink backdrop:bg-black/35">
    <div className="flex flex-col gap-4">
      <p className="text-caption text-primary">자취방 설명서</p>
      <h2 id={`${id}-title`} className="font-heading text-title font-bold">{title}</h2>
      <p className="text-body text-muted">{subtitle}</p>
      <p id={`${id}-description`} className="rounded-card bg-soft p-4 text-body text-danger">{children}</p>
      <Button ref={cancelRef} variant="secondary" onClick={onCancel}>취소</Button>
      <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
    </div>
  </dialog>
}
