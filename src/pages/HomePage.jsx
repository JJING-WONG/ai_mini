import { formatManagedDate, useDataViews } from '../contexts/useDataViews.js'
import { Link, useSearchParams } from 'react-router-dom'
import ItemCard from '../components/ui/ItemCard.jsx'
import { defaultSpaces } from '../data/defaultSpaces.js'
import HomeStatusSummary from '../features/home/components/HomeStatusSummary.jsx'
import { homePreviewScenarios, homePreviewDateLabel } from '../features/home/data/homePreview.js'
import addIcon from '../assets/icons/home-add.svg'
import leafIcon from '../assets/icons/home-leaf.svg'
import allArrow from '../assets/icons/home-all-arrow.svg'

function HomeItem({ item, unset = false, preview = false }) {
  const spaceName = item.spaceName || defaultSpaces.find(space => space.id === item.spaceId)?.name
  const query = preview ? '?preview=scheduled' : ''
  const recordAction = !unset || (item.intervalDays != null && !item.lastManagedDate)
  return (
    <ItemCard title={<Link to={`/items/${item.id}${query}`} className="rounded-sm hover:underline">{item.name}</Link>} status={item.status} statusDetail={item.statusDetail || item.detail}
      action={<Link to={recordAction ? `/items/${item.id}/record${query}` : `/items/${item.id}/edit`} className="text-label font-bold text-primary hover:underline">{recordAction ? '관리 완료 기록하기 →' : '주기 설정하러 가기 →'}</Link>}>
      {item.scheduleError || (unset ? '주기 또는 마지막 관리일을 설정해 주세요.' : `${spaceName} · 다음 관리일 ${item.nextManagedLabel || item.nextDateLabel}`)}
    </ItemCard>
  )
}

export default function HomePage() {
  const { itemViews, today } = useDataViews()
  const [params] = useSearchParams()
  const requestedPreview = import.meta.env.DEV ? params.get('preview') : null
  const scenario = Object.hasOwn(homePreviewScenarios, requestedPreview) ? requestedPreview : null
  const items = scenario ? homePreviewScenarios[scenario].items : itemViews
  const dateLabel = scenario ? homePreviewDateLabel : formatManagedDate(today)
  // 고정 예시 데이터는 지연 → 오늘 → 임박 → 예정 순으로 미리 배치되어 있습니다.
  const scheduledItems = items.filter(item => item.status !== 'unset')
  const unsetItems = items.filter(item => item.status === 'unset')
  const hasSchedule = scheduledItems.length > 0

  if (!items.length) {
    return (
      <section className="flex flex-col gap-4">
        <p className="text-caption text-primary">자취방 설명서</p>
        <h1 className="font-heading text-title font-bold">우리 집 관리를 시작해요</h1>
        <p className="text-body text-muted">현재 등록된 관리 항목이 없어요.</p>
        <p className="rounded-card bg-soft p-4 text-body text-primary">관리할 항목을 추가하면 관리 주기와 기록을 확인할 수 있어요.</p>
        <Link to="/items/new" className="flex min-h-[52px] items-center justify-center rounded-card border border-line bg-primary px-[18px] py-2.5 text-label font-bold text-white hover:brightness-95">첫 관리 대상 추가</Link>
      </section>
    )
  }

  if (hasSchedule) {
    return (
      <section className="flex flex-col gap-4">
        <p className="text-caption text-primary">자취방 설명서</p>
        <h1 className="font-heading text-title font-bold">{items.some(item => ['overdue', 'today'].includes(item.status)) ? '오늘 챙길 관리가 있어요' : '다가오는 관리를 확인해요'}</h1>
        <p className="text-body text-muted">{dateLabel}</p>
        <HomeStatusSummary items={items} compact />
        <section aria-label="관리 일정" className="flex flex-col gap-4">
          {scheduledItems.map(item => <HomeItem key={item.id} item={item} preview={Boolean(scenario)} />)}
        </section>
        {unsetItems.length > 0 && <section aria-labelledby="home-unset-title" className="flex flex-col gap-4">
          <h2 id="home-unset-title" className="text-label font-bold">아직 일정이 없는 항목</h2>
          {unsetItems.map(item => <HomeItem key={item.id} item={item} preview={Boolean(scenario)} unset />)}
        </section>}
      </section>
    )
  }

  return (
    <section>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11.5px] font-medium text-subtle">{dateLabel}</p>
          <h1 className="mt-1.5 font-heading text-2xl leading-[33px] font-bold tracking-[-0.6px]">오늘도 우리 집,<br />잘 돌보고 있어요</h1>
          <p className="mt-1.5 text-[12.5px] text-subtle">급하게 챙길 항목은 없어요</p>
        </div>
        <Link to="/items/new" aria-label="관리 대상 추가" className="mt-1 flex h-[26px] w-10 shrink-0 items-center justify-center rounded-full border border-line hover:bg-soft">
          <img src={addIcon} alt="" className="[transform:scaleY(-1)]" />
        </Link>
      </header>
      <div className="mt-5"><HomeStatusSummary items={items} /></div>
      <section aria-labelledby="home-notice-title" className="mt-7 flex items-start gap-3 rounded-card border border-summary-foreground bg-soft p-[17px]">
        <span aria-hidden="true" className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-input bg-primary"><img src={leafIcon} alt="" className="[transform:scaleY(-1)]" /></span>
        <div className="min-w-0">
          <h2 id="home-notice-title" className="text-body font-semibold text-summary-deep">오늘은 급한 관리가 없어요</h2>
          <p className="mt-1 text-[11.5px] leading-[18.688px] text-summary">등록된 항목의 주기를 설정하면 다음 관리일을 알려드릴게요.</p>
        </div>
      </section>
      {!scenario && unsetItems.length > 0 && <section aria-labelledby="home-default-unset-title" className="mt-6 flex flex-col gap-4">
        <h2 id="home-default-unset-title" className="text-label font-bold">아직 일정이 없는 항목</h2>
        {unsetItems.map(item => <HomeItem key={item.id} item={item} unset />)}
      </section>}
      <Link to="/items" className="mt-7 flex items-center justify-center gap-1.5 rounded-card border border-line px-[17px] py-px text-[15px] leading-[19.2px] font-semibold hover:bg-soft">
        전체 관리 대상 보기<img src={allArrow} alt="" className="shrink-0 [transform:scaleY(-1)]" />
      </Link>
    </section>
  )
}
