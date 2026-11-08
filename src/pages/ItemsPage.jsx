import { useDataViews } from '../contexts/useDataViews.js'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { defaultSpaces } from '../data/defaultSpaces.js'
import ItemCard from '../components/ui/ItemCard.jsx'
import ItemListCard from '../features/items/components/ItemListCard.jsx'
import { itemsPreviewScenarios } from '../features/items/data/itemsPreview.js'
import addLight from '../assets/icons/add-light.svg'
import addDark from '../assets/icons/add-dark.svg'
import kitchenTab from '../assets/icons/kitchen-tab.svg'
import bathroomTab from '../assets/icons/bathroom-tab.svg'
import kitchenSection from '../assets/icons/kitchen-section.svg'
import bathroomSection from '../assets/icons/bathroom-section.svg'

const spaceIcons = {
  kitchen: { tab: kitchenTab, section: kitchenSection },
  bathroom: { tab: bathroomTab, section: bathroomSection },
}

function SourceIcon({ src }) {
  return <img src={src} alt="" aria-hidden="true" className="shrink-0 [transform:scaleY(-1)]" />
}

export default function ItemsPage() {
  const [params] = useSearchParams()
  const requestedPreview = import.meta.env.DEV ? params.get('preview') : null
  const scenario = Object.hasOwn(itemsPreviewScenarios, requestedPreview) ? requestedPreview : null
  // 미리보기 상태가 바뀌면 공간 선택도 초기화합니다.
  return <ItemsView key={scenario} scenario={scenario} />
}

function ItemsView({ scenario }) {
  const [selectedSpace, setSelectedSpace] = useState('all')
  const { itemViews, spaces: storedSpaces } = useDataViews()
  const items = scenario ? itemsPreviewScenarios[scenario].items : itemViews
  const spaces = scenario ? itemsPreviewScenarios[scenario].spaceIds.map(id => defaultSpaces.find(space => space.id === id)) : storedSpaces
  const unsetCount = items.filter(item => item.status === 'unset').length
  const visibleItems = selectedSpace === 'all' ? items : items.filter(item => item.spaceId === selectedSpace)

  if (!items.length) {
    return (
      <section className="flex flex-col gap-4">
        <p className="text-caption text-primary">자취방 설명서</p>
        <h1 className="font-heading text-title font-bold">아직 관리 대상이 없어요</h1>
        <p className="text-body text-muted">공간을 고르고 관리할 항목을 추가해 보세요.</p>
        <p className="rounded-card bg-soft p-4 text-body text-primary">등록한 관리 대상이 이곳에 표시돼요. 필요한 항목부터 하나씩 시작해도 괜찮아요.</p>
        <Link to="/items/new" className="flex min-h-[52px] items-center justify-center rounded-card border border-line bg-primary px-[18px] py-2.5 text-label font-bold text-white hover:brightness-95">관리 대상 추가</Link>
      </section>
    )
  }

  return (
    <section>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11.5px] font-medium text-subtle">우리 집 관리 목록</p>
          <h1 className="mt-1 font-heading text-2xl leading-9 font-bold tracking-[-0.6px]">관리 대상</h1>
          <p className="mt-1 text-caption text-subtle">총 {items.length}개 항목 · 일정 미설정 {unsetCount}개</p>
        </div>
        <Link to="/items/new" className="mt-1 inline-flex shrink-0 items-center justify-center gap-1.5 rounded-input bg-primary px-3 text-body leading-[19.2px] font-semibold text-canvas hover:brightness-95">
          <SourceIcon src={addLight} />추가
        </Link>
      </header>

      <div aria-label="공간별 보기" className="-mx-5 mt-4 flex gap-1.5 overflow-x-auto px-5 pb-1">
        {[{ id: 'all', name: '전체' }, ...spaces].map(space => {
          const active = selectedSpace === space.id
          const count = space.id === 'all' ? items.length : items.filter(item => item.spaceId === space.id).length
          return (
            <button key={space.id} type="button" aria-pressed={active} onClick={() => setSelectedSpace(space.id)}
              className={`inline-flex shrink-0 items-center justify-center gap-1 rounded-full border px-[13px] py-[6px] text-caption leading-[14.4px] font-semibold ${active ? 'border-primary bg-primary text-canvas' : 'border-line bg-canvas text-muted hover:bg-soft'}`}>
              {spaceIcons[space.id] && <SourceIcon src={spaceIcons[space.id].tab} />}
              {space.name} {count}
            </button>
          )
        })}
      </div>

      <div className="mt-9 flex flex-col gap-6">
        {scenario === 'scheduled' || !scenario ? (
          <div className="flex flex-col gap-4">
            {visibleItems.map(item => <ItemCard key={item.id} title={<Link to={`/items/${item.id}${scenario ? '?preview=scheduled' : ''}`} className="rounded-sm hover:underline">{item.name}</Link>} status={item.status} statusDetail={item.statusDetail || item.detail}
              action={<Link to={item.status === 'unset' ? `/items/${item.id}` : `/items/${item.id}/record${scenario ? '?preview=scheduled' : ''}`} className="text-label font-bold text-primary hover:underline">{item.status === 'unset' ? '상세 보기 →' : '관리 완료 기록하기 →'}</Link>}>
              {item.spaceName || defaultSpaces.find(space => space.id === item.spaceId)?.name} · {item.scheduleError || (item.nextDueDate || item.nextDateLabel ? `다음 관리일 ${item.nextManagedLabel || item.nextDateLabel}` : '관리 일정이 아직 없어요')}
            </ItemCard>)}
          </div>
        ) : spaces.filter(space => selectedSpace === 'all' || selectedSpace === space.id).map(space => {
          const spaceItems = visibleItems.filter(item => item.spaceId === space.id)
          return (
            <section key={space.id} aria-labelledby={`space-${space.id}`}>
              <div className="mb-2.5 flex items-center gap-1.5">
                {spaceIcons[space.id] && <span className="flex size-5 items-center justify-center"><SourceIcon src={spaceIcons[space.id].section} /></span>}
                <h2 id={`space-${space.id}`} className="text-[12.5px] font-bold text-muted">{space.name}</h2>
                <span className="text-[11px] text-nav-muted">{spaceItems.length}개</span>
              </div>
              <div className="flex flex-col gap-2.5">{spaceItems.map(item => <ItemListCard key={item.id} item={item} />)}</div>
            </section>
          )
        })}
      </div>

      <Link to="/items/new" className="mt-7 flex items-center justify-center gap-1.5 rounded-card border border-line bg-canvas px-[17px] py-px text-[15px] leading-[19.2px] font-semibold hover:bg-soft">
        <SourceIcon src={addDark} />관리 대상 추가
      </Link>
    </section>
  )
}
