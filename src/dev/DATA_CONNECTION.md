# 데이터 연결 기반 (기능 개발 2단계)

## 저장 구조

- `homeguide:spaces`: 선택·등록한 사용자 공간 배열
- `homeguide:items`: 실제 사용자 관리 항목 배열
- `homeguide:histories`: initial/completed 기록 배열
- `homeguide:onboarding`: 완료 여부, 진행 단계, 선택 공간, 초안

최초 사용 시 빈 사용자 데이터로 시작합니다. 기본 콘텐츠 파일과 디자인 예시는 자동으로 localStorage에 복사하지 않습니다.
localStorage 접근은 repositories 내부에서만 처리합니다. AppDataProvider가 읽기를 완료한 다음 라우터를 표시합니다.
Repository는 JSON/필드 형식/중복 ID를 확인하고, 전체 로딩과 저장 전에는 공간→항목→기록 참조를 확인합니다.
손상·접근 거부 시 데이터 삭제/초기화 없이 오류와 다시 불러오기 버튼을 표시합니다.
저장 실패 시 Context 상태를 변경하지 않으며 `{ ok: false, error }`를 반환합니다.

## Context 사용

`useAppData()`는 `spaces`, `items`, `histories`, `onboarding`, `isLoading`, `saveError`, `saveResource`, `completeOnboarding`, `addItem`, `updateItem`, `deleteItem`, `addHistory`, `updateHistory`, `deleteHistory`, `reload`를 제공합니다.
`saveResource('spaces' | 'items' | 'histories' | 'onboarding', value)`는 한 종류의 전체 값을 검증·저장한 뒤 상태를 갱신합니다.
참조하는 항목·기록이 남아 있는 공간·항목의 제거는 거부됩니다. 온보딩은 `completeOnboarding(wizard)`로 네 종류를 함께 저장하며, 중단 복구를 지원합니다. 항목과 연결 기록의 삭제는 4단계에서 공통 트랜잭션으로 연결했습니다.

## 화면 연결

일반 URL의 홈·관리 목록·상세·히스토리·수정 폼은 Context 데이터를 조회합니다.
기존 `preview-*` ID는 개발 모드의 명시적인 디자인 미리보기 경로에서만 사용할 수 있습니다.
홈·목록은 `?preview=default`, 히스토리는 `?preview=default|single|empty`로 예시를 확인할 수 있습니다.
유효하지 않은 preview 값은 실제 데이터 화면을 표시합니다.
저장 모델에 상태/마지막 관리일/다음 관리일을 추가하지 않습니다. 표시할 마지막 관리일은 연결된 기록의 최신 날짜를 사용합니다.
5단계에서 다음 관리일·시급도 계산과 우선순위 정렬을 연결했습니다. MAINTENANCE.md를 참고하세요.

## 남은 연결

온보딩 완료·초안 복원·접근 제어는 3단계에서 연결했습니다. 실제 온보딩으로 사용자 데이터를 생성할 수 있습니다.
관리 대상 폼 저장·수정·삭제와 이미지 저장은 4단계에서 연결했습니다. 일정 계산은 5단계에서 연결했습니다. 기록 저장·수정·삭제도 6단계에서 연결했습니다. 일반 URL은 실제 데이터를 변경하고, 명시적인 개발용 디자인 예시 경로만 미리보기 안내를 표시합니다.

## 검증

`npm test`: Vitest로 저장소·온보딩·항목·관리 일정 검증을 함께 실행합니다. 날짜 경계와 시간대 차이도 검증합니다.
실제 브라우저 새로고침·클릭 확인은 브라우저 연결이 복구된 후 필요합니다.
