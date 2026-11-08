// 디자인 확인용 표시 데이터이며, 사용자 Item / History 데이터와 분리합니다.
// 날짜와 상태는 고정 예시입니다. 계산하거나 저장하지 않습니다.
const defaultItems = [
  { id: 'preview-sink', spaceId: 'kitchen', name: '싱크대 배수구 청소', status: 'unset' },
  { id: 'preview-hood', spaceId: 'kitchen', name: '주방 후드 필터 세척', status: 'unset' },
  { id: 'preview-bath-drain', spaceId: 'bathroom', name: '욕실 배수구 청소', status: 'unset' },
  { id: 'preview-shower', spaceId: 'bathroom', name: '샤워기 헤드 세척', status: 'unset' },
]

const scheduledItems = [
  { id: 'preview-laundry', spaceId: 'laundry', name: '세탁조 세척', status: 'overdue', detail: '2일 지남', nextDateLabel: '11월 5일' },
  { id: 'preview-hood', spaceId: 'kitchen', name: '주방 후드 필터 세척', status: 'today', nextDateLabel: '11월 7일' },
  { id: 'preview-ac', spaceId: 'living', name: '에어컨 필터 청소', status: 'upcoming', detail: '2일 남음', nextDateLabel: '11월 9일' },
  { id: 'preview-screen', spaceId: 'living', name: '방충망 청소', status: 'scheduled', detail: '13일 남음', nextDateLabel: '11월 20일' },
  { id: 'preview-sink', spaceId: 'kitchen', name: '싱크대 배수구 청소', status: 'unset' },
]

export const itemsPreviewScenarios = {
  default: { items: defaultItems, spaceIds: ['kitchen', 'bathroom'] },
  scheduled: { items: scheduledItems, spaceIds: ['kitchen', 'laundry', 'living'] },
  empty: { items: [], spaceIds: [] },
}
