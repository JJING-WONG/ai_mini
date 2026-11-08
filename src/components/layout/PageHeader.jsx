import { Link } from 'react-router-dom'
import backIcon from '../../assets/icons/back.svg'
import LayoutIcon from './LayoutIcon.jsx'

export default function PageHeader({ title, description, backTo, action }) {
  return (
    <header className="flex shrink-0 items-center gap-2 bg-canvas/95 px-4 pt-[calc(16px+env(safe-area-inset-top))] pb-3 backdrop-blur-sm">
      {backTo && (
        <Link to={backTo} aria-label="이전 화면으로" className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-soft">
          <LayoutIcon src={backIcon} width={7.1101} height={11.66} />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="font-heading text-[17px] leading-[25.5px] font-bold">{title}</h1>
        {description && <p className="mt-0.5 text-[11.5px] leading-[17.25px] text-subtle">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}
