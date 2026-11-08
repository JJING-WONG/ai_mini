# 관리 기록 기능 (6단계)

## 실제 사용자 흐름

- `/items/:itemId/record`: 관리 날짜(필수), 사용 제품·부품과 메모(선택)를 입력하고 저장합니다. 성공하면 해당 항목 상세로 이동합니다.
- `/history/:historyId/edit`: 날짜·제품·메모를 수정합니다. ID, itemId, type(initial/completed), createdAt은 유지합니다. 성공하면 히스토리로 이동합니다.
- 수정 화면의 기록 삭제 버튼: 확인창에서 삭제 후 히스토리로 이동합니다. 취소하면 변경하지 않습니다.
- 저장하지 않은 일반 기록 폼의 입력은 새로고침 시 복원하지 않습니다. 저장 성공한 기록은 Repository에서 다시 불러옵니다.

오늘 또는 과거의 올바른 YYYY-MM-DD 날짜만 저장할 수 있습니다. 선택한 날짜로 추가·수정 후의 예상 일정을 표시하며, 예상 일정 계산 자체는 데이터를 저장하지 않습니다.
더 과거인 기록을 추가해도 최신 기록 기준을 유지하고, 날짜를 수정하면 해당 기록을 대체한 결과로 예상 일정을 계산합니다.
주기가 없는 항목도 기록은 남길 수 있지만 다음 관리일은 미설정입니다.
동일 날짜 기록을 여러 건 등록할 수 있으며 각각 별도 ID를 사용합니다. 처리 중 제출·삭제 재실행은 ref 잠금으로 막습니다.

## 저장 경로와 오류

RecordForm → Context addHistory/updateHistory/deleteHistory → historyService → historyRepository 순으로 처리합니다.
기록 배열 하나만 바뀌므로 localStorage의 단일 키 저장에 성공한 뒤 공유 상태를 갱신합니다. 실패하면 기존 기록·일정이 유지되고 입력을 보존하며 재시도할 수 있습니다.
최신 기록 삭제 시 남은 기록의 최신 날짜를 사용하고, 해당 항목의 기록이 모두 없어지면 마지막 관리일·다음 관리일이 null이 됩니다. 다른 항목 기록은 변경하지 않습니다.
없는 항목·기록에는 폼과 저장 버튼을 표시하지 않습니다.

## 개발용 디자인 미리보기

- `/items/preview-sink/record`: 빈 폼
- `/items/preview-sink/record?preview=filled`: 입력 예시
- `/items/preview-ac/record?preview=past`: 과거 날짜 예시
- `/items/preview-custom/record`: 주기 미설정
- `/history/preview-history-ac-1/edit`: 완료 기록
- `/history/preview-history-ac-2/edit`: 초기 기록
- `/items/preview-ac/record?preview=errors`, `/history/preview-history-ac-1/edit?preview=save-error`: 오류·실패 예시

명시적인 개발용 예시 경로에서는 실제 사용자 데이터를 저장·삭제하지 않습니다. 피그마 고정 날짜 예시와 실제 일정 계산은 분리합니다.

## 검증

Vitest로 추가·수정·삭제, 날짜 검증, 동일 날짜 중복, 초기 기록 메타데이터 보존, 주기 없음, 최신/전체 기록 삭제, 저장 실패 원본 보존 및 저장 후 재조회를 검증했습니다.
서버 렌더링으로 저장 후 홈·목록·상세·히스토리 갱신, 수정 폼 값, 예상 일정, 없는 ID 및 디자인 미리보기를 확인했습니다.
실제 브라우저 클릭·중복 클릭·모달·새로고침·모바일 배치 검증은 브라우저 연결 오류로 미완료입니다.
