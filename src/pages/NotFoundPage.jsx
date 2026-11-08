import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return <section className="flex flex-col gap-4">
    <p className="text-caption text-primary">자취방 설명서</p>
    <h1 className="font-heading text-title font-bold">페이지를 찾을 수 없어요</h1>
    <p className="text-body text-muted">주소가 잘못되었거나 사용할 수 없는 페이지예요.</p>
    <p className="text-2xl font-bold text-primary">404</p>
    <Link to="/home" className="flex min-h-[52px] items-center justify-center rounded-card border border-line bg-primary px-[18px] text-label font-bold text-white">홈으로 이동</Link>
    <Link to="/items" className="flex min-h-[52px] items-center justify-center rounded-card border border-line bg-surface px-[18px] text-label font-bold">관리 대상 보기</Link>
  </section>
}
