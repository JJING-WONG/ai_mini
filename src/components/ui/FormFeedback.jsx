import Button from './Button.jsx'

export default function FormFeedback({ errors, failed, formId, onDismiss, simulated = true, message }) {
  if (Object.keys(errors).length) return <section role="alert" className="rounded-card bg-detail-soft p-4">
    <h2 className="text-label font-bold">입력 내용을 확인해 주세요</h2>
    <p className="mt-1 text-body text-muted">오류가 있는 항목을 수정한 뒤 저장해 주세요.</p>
  </section>
  if (!failed) return null
  return <section role="alert" className="flex flex-col gap-4">
    <h2 className="font-heading text-title font-bold">저장하지 못했어요</h2>
    <p className="text-body text-muted">입력한 내용은 현재 화면에 남아 있어요.</p>
    <p className="rounded-card bg-soft p-4 text-body text-danger">{message || '브라우저 저장 공간에 저장할 수 없어요. 입력 내용을 확인하고 다시 시도해 주세요.'}</p>
    {simulated && <p className="text-caption text-subtle">저장 실패 상황을 보여주는 디자인 미리보기예요.</p>}
    <Button type="submit" form={formId}>다시 저장하기</Button>
    <Button variant="secondary" onClick={onDismiss}>입력 화면으로 돌아가기</Button>
  </section>
}
