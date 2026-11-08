# 전체 히스토리 확인

`/history`는 저장된 사용자 기록을 managedAt 최신순으로 표시하며 같은 날짜끼리 묶습니다. initial/completed 유형과 제품·메모를 표시하고, 기록 수정 및 관련 관리 대상으로 이동할 수 있습니다.
전체 건수와 날짜별 건수는 실제 표시 데이터에서 집계합니다. createdAt을 관리 날짜 대신 사용하지 않습니다.
기록 추가·수정·삭제 후 Context에서 바로 갱신됩니다. 상세 화면에는 해당 Item의 기록만 표시합니다.

개발용 디자인 예시:
- `/history?preview=default`: 예시 전체 목록
- `/history?preview=single`: 예시 1건
- `/history?preview=empty`: 빈 상태

유효하지 않은 preview 값은 실제 사용자 목록을 표시합니다. 개발용 예시 날짜·요일은 피그마 고정 문구이며 실제 데이터와 분리합니다.
기록 기능과 검증 범위는 RECORD_FORM_PREVIEW.md를 참고하세요.
