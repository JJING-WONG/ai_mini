// 상세 디자인을 위한 표시 전용 데이터입니다. Item / History 저장 모델이 아닙니다.
// 일정·기록은 고정 예시이며 실제 날짜 계산이나 영속화에 사용하지 않습니다.
const emptyProduct = { modelName: '', specification: '', memo: '' }
const emptySchedule = { status: 'unset', intervalLabel: '미설정', lastManagedLabel: '아직 없음', nextManagedLabel: '계산되지 않음' }
const records = [
  { id: 'preview-history-ac-1', managedAt: '2026-10-26', managedAtLabel: '2026년 10월 26일', type: 'completed', productUsed: '중성세제', memo: '필터를 세척하고 건조했어요.' },
  { id: 'preview-history-ac-2', managedAt: '2026-10-12', managedAtLabel: '2026년 10월 12일', type: 'initial', productUsed: '', memo: '' },
]
const details = {
  'preview-sink': { name: '싱크대 배수구 청소', spaceName: '주방', templateId: 'kitchen-sink-drain', ...emptyProduct, ...emptySchedule, intervalLabel: '2주마다', histories: [] },
  'preview-hood': { name: '주방 후드 필터 세척', spaceName: '주방', templateId: 'kitchen-hood-filter', ...emptyProduct, ...emptySchedule, intervalLabel: '30일마다', histories: [] },
  'preview-bath-drain': { name: '욕실 배수구 청소', spaceName: '욕실', templateId: 'bathroom-floor-drain', ...emptyProduct, ...emptySchedule, histories: [] },
  'preview-shower': { name: '샤워기 헤드 세척', spaceName: '욕실', templateId: 'bathroom-showerhead', ...emptyProduct, ...emptySchedule, histories: [] },
  'preview-laundry': { name: '세탁조 세척', spaceName: '세탁 공간', templateId: 'laundry-drum', ...emptyProduct, status: 'overdue', statusDetail: '2일 지남', intervalLabel: '30일마다', lastManagedLabel: '2026년 10월 6일', nextManagedLabel: '2026년 11월 5일', histories: [
    { id: 'preview-history-laundry-1', managedAt: '2026-10-06', managedAtLabel: '2026년 10월 6일', type: 'completed', productUsed: '통세척 세제', memo: '' },
  ] },
  'preview-ac': { name: '에어컨 필터 청소', spaceName: '생활 공간', templateId: 'living-ac-filter', modelName: 'LG 휘센', specification: '극세 필터', memo: '완전히 말린 뒤 장착하기', status: 'upcoming', statusDetail: '2일 남음', intervalLabel: '14일마다', lastManagedLabel: '2026년 10월 26일', nextManagedLabel: '2026년 11월 9일', histories: records },
  'preview-screen': { name: '방충망 청소', spaceName: '생활 공간', templateId: 'living-window-screen', ...emptyProduct, status: 'scheduled', statusDetail: '13일 남음', intervalLabel: '180일마다', lastManagedLabel: '2026년 5월 24일', nextManagedLabel: '2026년 11월 20일', histories: [
    { id: 'preview-history-screen-1', managedAt: '2026-05-24', managedAtLabel: '2026년 5월 24일', type: 'initial', productUsed: '', memo: '' },
  ] },
  'preview-custom': { name: '베란다 바닥 청소', spaceName: '베란다', templateId: null, ...emptyProduct, ...emptySchedule, memo: '화분을 옮긴 뒤 바닥을 닦기', lastManagedLabel: '2026년 11월 7일', histories: [
    { id: 'preview-history-custom-1', managedAt: '2026-11-07', managedAtLabel: '2026년 11월 7일', type: 'completed', productUsed: '바닥 세정제', memo: '화분 아래까지 청소했어요.' },
  ] },
}

export function getItemDetailPreview(itemId, preview) {
  if (!Object.hasOwn(details, itemId)) return null
  const item = { id: itemId, ...details[itemId] }
  if (import.meta.env.DEV && preview === 'scheduled' && itemId === 'preview-hood') {
    return { ...item, status: 'today', lastManagedLabel: '2026년 10월 8일', nextManagedLabel: '2026년 11월 7일', histories: [
      { id: 'preview-history-hood-1', managedAt: '2026-10-08', managedAtLabel: '2026년 10월 8일', type: 'completed', productUsed: '중성세제', memo: '' },
    ] }
  }
  return item
}
