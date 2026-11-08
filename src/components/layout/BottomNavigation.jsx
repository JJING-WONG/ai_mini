import { NavLink } from 'react-router-dom'
import itemsIcon from '../../assets/icons/items.svg'
import homeIcon from '../../assets/icons/home.svg'
import historyIcon from '../../assets/icons/history.svg'
import LayoutIcon from './LayoutIcon.jsx'

const tabs = [
  { to: '/items', label: '관리 대상', icon: itemsIcon, width: 15.75, height: 14 },
  { to: '/home', label: '홈', icon: homeIcon, width: 15.75, height: 16.38, end: true },
  { to: '/history', label: '히스토리', icon: historyIcon, width: 17.5, height: 17.5 },
]

export default function BottomNavigation() {
  return (
    <nav aria-label="주요 메뉴" className="shrink-0 border-t border-divider bg-canvas/95 px-3 pt-px pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
      <ul className="grid grid-cols-3 py-1.5">
        {tabs.map(({ to, label, icon, width, height, end }) => (
          <li key={to}>
            <NavLink to={to} end={end} className={({ isActive }) => `flex min-h-[58.5px] flex-col items-center justify-center gap-0.5 rounded-card py-2 text-[11px] leading-[16.5px] hover:bg-soft ${isActive ? 'font-bold text-primary' : 'font-medium text-nav-muted'}`}>
              <LayoutIcon src={icon} width={width} height={height} />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
