import { Link, useSearchParams } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import TextField from '../components/ui/TextField.jsx'

export default function LayoutPreviewPage() {
  const [params] = useSearchParams()
  const form = params.get('mode') === 'form'
  const long = params.get('long') === 'true'
  return (
    <AppLayout title={form ? '관리 대상 추가' : '레이아웃 미리보기'} description={form ? '우리 집에 맞는 관리 항목을 등록해요' : '헤더와 하단 영역을 확인하는 개발용 화면'}
      backTo="/dev/ui" bottomNavigation={!form}
      bottomAction={form ? <Button onClick={() => window.alert('디자인 확인용 버튼입니다. 저장하지 않습니다.')}>저장하기</Button> : null}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 text-caption text-primary underline">
          <Link to="?mode=nav">하단 메뉴</Link><Link to="?mode=form">하단 버튼</Link><Link to={`?mode=${form ? 'form' : 'nav'}&long=true`}>긴 본문</Link>
        </div>
        {form && <TextField label="관리 항목 이름" placeholder="예: 베란다 바닥 청소" />}
        {Array.from({ length: long ? 12 : 1 }, (_, index) => <Card key={index}><h2 className="text-label font-bold">본문 영역 {index + 1}</h2><p className="text-muted">화면을 스크롤해도 헤더와 하단 영역이 유지됩니다. 본문 마지막 내용까지 가리지 않고 표시합니다.</p></Card>)}
        <p className="text-caption text-muted">본문 마지막 · 하단 영역에 가려지지 않아야 합니다.</p>
      </div>
    </AppLayout>
  )
}
