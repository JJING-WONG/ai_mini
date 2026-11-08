const statuses = {
  overdue: { label: '관리 지연', color: 'text-danger' },
  today: { label: '오늘 관리', color: 'text-primary' },
  upcoming: { label: '관리 임박', color: 'text-warning' },
  scheduled: { label: '관리 예정', color: 'text-muted' },
  unset: { label: '미설정', color: 'text-muted' },
}

// 표시 전용입니다. 날짜 비교와 상태 계산은 이후 Service 계층에서 처리합니다.
export default function StatusBadge({ status = 'unset', detail, className = '' }) {
  const { label, color } = statuses[status] || statuses.unset
  return <span className={`text-caption ${color} ${className}`}>{label}{detail && ` · ${detail}`}</span>
}
