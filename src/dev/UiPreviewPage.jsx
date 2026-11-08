import { useState } from 'react'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import TextField from '../components/ui/TextField.jsx'
import TextArea from '../components/ui/TextArea.jsx'
import SelectField from '../components/ui/SelectField.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import ItemCard from '../components/ui/ItemCard.jsx'

function PreviewSection({ title, children }) {
  return <section className="flex min-w-0 flex-col gap-4"><h2 className="text-label font-bold">{title}</h2>{children}</section>
}

export default function UiPreviewPage() {
  const [message, setMessage] = useState('버튼을 누르면 이곳에 표시됩니다.')
  return (
    <main className="mx-auto flex w-full max-w-[375px] flex-col gap-8 px-5 py-6">
      <header className="flex flex-col gap-2">
        <p className="text-caption text-primary">자취방 설명서 · 개발용 미리보기</p>
        <h1 className="font-heading text-title font-bold">공통 스타일·UI</h1>
        <p className="text-body text-muted">피그마 공통 UI 확인용 화면입니다. 입력 내용은 저장하지 않습니다.</p>
      </header>
      <PreviewSection title="서체와 색상">
        <p className="font-heading text-title font-bold">우리 집을 돌보는 작은 습관</p>
        <p className="text-label font-bold">관리 항목 이름 · Label 14</p>
        <p className="text-body text-muted">권장 주기를 참고해 내 생활에 맞게 조정해요. Body 13</p>
        <p className="text-caption text-primary">안내 문구 · Caption 12</p>
        <div className="grid grid-cols-3 gap-2 text-caption">
          {[
            ['기본 배경', 'bg-canvas text-ink'], ['카드 배경', 'bg-surface text-ink'],
            ['기본 강조', 'bg-primary text-white'], ['안내 배경', 'bg-soft text-primary'],
            ['지연·오류', 'bg-danger text-white'], ['관리 임박', 'bg-warning text-white'],
          ].map(([label, color]) => <div key={label} className={`rounded-input border border-line p-3 ${color}`}>{label}</div>)}
        </div>
      </PreviewSection>
      <PreviewSection title="버튼">
        <Button onClick={() => setMessage('기본 버튼을 눌렀습니다.')}>저장하기</Button>
        <Button variant="secondary" onClick={() => setMessage('보조 버튼을 눌렀습니다.')}>취소</Button>
        <Button variant="danger" onClick={() => setMessage('삭제 버튼의 디자인 예시입니다. 데이터는 삭제하지 않습니다.')}>관리 대상 삭제</Button>
        <Button disabled>다음</Button>
        <Button variant="text" onClick={() => setMessage('텍스트 버튼을 눌렀습니다.')}>관리 완료 기록하기 →</Button>
        <p role="status" className="text-caption text-muted">{message}</p>
      </PreviewSection>
      <PreviewSection title="입력창">
        <TextField label="관리 항목 이름" required placeholder="예: 베란다 바닥 청소" hint="필수 항목을 입력해 주세요." />
        <TextField label="관리 주기 (선택)" type="number" min="1" step="1" placeholder="일 단위" hint="비워 두면 주기 미설정으로 등록돼요." />
        <TextField label="관리 항목 이름 · 오류 예시" required error="관리 항목 이름을 입력해 주세요." />
        <TextField label="관리 날짜" type="date" />
        <SelectField label="소속 공간" required defaultValue="">
          <option value="" disabled>공간 선택</option><option value="kitchen">주방</option><option value="bathroom">욕실</option>
        </SelectField>
        <TextArea label="메모 (선택)" placeholder="관리할 때 기억할 내용을 적어 주세요." />
        <TextField label="입력 비활성 상태" disabled defaultValue="변경할 수 없는 입력창" />
      </PreviewSection>
      <PreviewSection title="상태 표시 · 계산 없이 표시만">
        <div className="flex flex-wrap gap-x-4 gap-y-3">
          <StatusBadge status="overdue" detail="2일 지남" /><StatusBadge status="today" />
          <StatusBadge status="upcoming" detail="2일 남음" /><StatusBadge status="scheduled" /><StatusBadge status="unset" />
        </div>
      </PreviewSection>
      <PreviewSection title="카드">
        <ItemCard title="에어컨 필터 청소" status="upcoming" statusDetail="2일 남음"
          action={<Button variant="text" onClick={() => setMessage('카드 안의 버튼을 눌렀습니다. 기록은 저장하지 않습니다.')}>관리 완료 기록하기 →</Button>}>
          생활 공간 · 다음 관리일 11월 9일
        </ItemCard>
        <ItemCard title="싱크대 배수구 청소" status="unset">주기 또는 마지막 관리일을 설정해 주세요.</ItemCard>
        <Card><h3 className="text-label font-bold">기본 정보 카드</h3><p className="text-body text-muted">제품 정보와 안내를 담는 공통 카드입니다.</p></Card>
      </PreviewSection>
    </main>
  )
}
