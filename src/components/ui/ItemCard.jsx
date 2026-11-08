import { useId } from 'react'
import Card from './Card.jsx'
import StatusBadge from './StatusBadge.jsx'

export default function ItemCard({ title, status, statusDetail, children, action, className = '' }) {
  const titleId = useId()
  return (
    <article aria-labelledby={titleId} className={className}>
      <Card>
        <StatusBadge status={status} detail={statusDetail} />
        <h3 id={titleId} className="text-label font-bold">{title}</h3>
        {children && <div className="text-body whitespace-pre-line text-muted">{children}</div>}
        {action}
      </Card>
    </article>
  )
}
