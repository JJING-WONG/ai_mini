# 10단계 공통 예외 UI

관리 대상 폼과 삭제 확인창은 4단계에서 실제 저장에 연결했습니다. 기록 폼과 기록 삭제 확인창도 6단계에서 실제 저장에 연결했습니다. 조회 데이터는 Repository·Context에 연결되어 있습니다. 새로고침하면 입력과 안내 상태는 초기화됩니다.

## 확인 경로 (npm run dev)

- `/items/new?preview=errors`: 공간·이름·주기 오류 표시
- `/items/new?preview=save-error`: 입력값을 유지하는 저장 실패 예시
- `/items/preview-ac/record?preview=errors`: 미래 날짜 오류 예시
- `/history/preview-history-ac-1/edit?preview=save-error`: 기록 저장 실패 예시
- `/items/preview-ac`: 아래의 관리 대상 삭제 버튼 → 확인창
- `/history/preview-history-ac-1/edit`: 기록 삭제 버튼 → 확인창
- `/not-a-page`: 404 및 홈·목록 이동

`preview=errors`, `preview=save-error`는 개발 모드에서만 적용됩니다.
일반 폼도 제출 시 필수 입력, 양의 정수 주기, 오늘 이하 날짜를 HTML 입력 제약으로 확인하고 첫 오류에 포커스를 이동합니다. 오류는 필드의 aria-invalid와 설명에 연결됩니다.

삭제 확인창은 native dialog를 사용합니다. 취소에 초기 포커스를 두고 Escape/취소로 닫으며 이전 버튼으로 포커스를 돌려줍니다. 관리 대상 삭제는 일반 경로에서 실제 저장 데이터와 연결 기록을 삭제합니다. 기록 삭제도 실제 기록을 삭제하고 일정을 갱신합니다. preview-* 디자인 경로에서는 미리보기 안내만 표시합니다.
저장 실패는 강제로 보여주는 디자인 상태입니다. 재시도는 동일한 실패 예시를 다시 표시하며 실제 localStorage 접근이나 저장은 없습니다. 입력 화면으로 돌아가도 입력값은 유지됩니다.

## 검증 범위

빌드·ESLint와 서버 렌더링으로 오류 상태, 경로, 입력값 유지, 404 링크, dialog 마크업을 확인합니다. 브라우저 연결 도구가 사용 불가하여 실제 클릭, 키보드 포커스 이동, 모바일 배치 검증은 미완료입니다.

현재 데이터 연결 범위와 미리보기 분리는 [DATA_CONNECTION.md](./DATA_CONNECTION.md)를 참고하세요.
