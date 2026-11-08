import { itemsPreviewScenarios } from '../../items/data/itemsPreview.js'

// 피그마와 같은 표시 전용 예시입니다. 날짜나 관리 상태를 계산하지 않습니다.
// 목록 화면과 같은 임시 항목 ID를 사용하며 사용자 데이터로 저장하지 않습니다.
export const homePreviewScenarios = {
  default: { items: itemsPreviewScenarios.default.items },
  scheduled: { items: itemsPreviewScenarios.scheduled.items },
  empty: { items: [] },
}

export const homePreviewDateLabel = '11월 7일 · 토요일'
