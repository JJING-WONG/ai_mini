# 관리 대상 상세 디자인 확인

- `/items/preview-sink`: 주기만 설정, 관리일·기록·제품 정보 없음
- `/items/preview-ac`: 관리 임박, 제품 정보·메모, 최신순 완료 기록과 초기 관리일
- `/items/preview-laundry`: 관리 지연
- `/items/preview-hood?preview=scheduled`: 오늘 관리
- `/items/preview-screen`: 관리 예정, 서비스 참고값 출처
- `/items/preview-custom`: 직접 추가한 항목, 주기 없음, 기존 기록 있음
- `/items/unknown`: 존재하지 않는 항목 안내

기본 목록·홈의 임시 ID를 그대로 사용합니다. 일정이 있는 목록에서 상세로 이동할 때 개발용 preview 매개변수를 유지합니다.
날짜·기록은 표시 전용 고정 예시이며 실제 Item/History 저장 모델이 아닙니다.
기본 콘텐츠는 templateId로 src/data/defaultItems.js를 참조합니다.
사진 원본이 제공되지 않아 이미지 미등록 상태를 표시합니다. 업로드/저장은 구현하지 않습니다.
수정·기록·기록 수정 링크는 기존 임시 페이지로 이동하며 삭제 버튼은 비활성 표시만 합니다.
