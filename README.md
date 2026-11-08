# 자취방 설명서

처음 자취하는 사용자가 집 안의 관리 항목을 발견하고, 관리 주기를 설정하고, 관리 기록을 남길 수 있도록 돕는 웹서비스입니다.

대학교 전공 수업의 개인 프로젝트로, 모바일 화면을 우선으로 구현했습니다.

## 주요 기능

- **온보딩:** 공간 선택 → 관리 항목 선택 → 주기·초기 관리일 설정, 진행 상태 자동 저장·복원
- **관리 대상:** 기본 항목 선택 또는 직접 등록, 공간 추가, 항목 수정·삭제, 제품 정보·이미지 저장
- **관리 일정:** 최신 관리 기록과 사용자 주기로 다음 관리일 계산, 상태별 우선순위 정렬
- **관리 히스토리:** 기록 작성·조회·수정·삭제, 기록 변경에 따른 일정 재계산
- **오류 처리:** 입력 검증, 삭제 확인, 저장 실패 안내와 재시도, 중단된 일괄 저장 복구

기본 콘텐츠는 공간 5개와 관리 항목 22개로 구성됩니다. 기본 항목의 이름을 수정해도 관리 안내 연결은 유지하며, 사용자가 ‘직접 등록 항목으로 전환’을 선택하면 연결을 해제합니다.

## 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| 화면 | React, JavaScript/JSX, Vite |
| 스타일 | Tailwind CSS |
| 라우팅 | React Router |
| 상태 관리 | React Context, useState |
| 데이터 저장 | localStorage |
| 테스트 | Vitest, Testing Library, jsdom |
| 배포 설정 | Vercel |

Repository가 저장소 접근, Service가 비즈니스 로직, Context가 화면의 공유 상태를 담당합니다.

## 로컬 실행

Node.js **22.x**와 npm이 필요합니다. nvm을 사용한다면 `nvm use`로 `.nvmrc`의 버전을 적용할 수 있습니다.

```sh
npm ci
npm run dev
```

터미널에 표시된 주소를 브라우저에서 엽니다. 첫 접속은 `/`의 온보딩에서 시작하고, 설정을 완료하면 `/home`으로 이동합니다.

`npm ci`는 `package-lock.json`에 고정된 버전으로 패키지를 설치하는 명령입니다. GitHub Actions 설정 파일과 관계없이 사용할 수 있습니다. 패키지를 추가하거나 버전을 변경할 때는 `npm install`을 사용하고 잠금 파일도 함께 커밋합니다.

## 테스트와 빌드

배포 전 로컬에서 다음 명령으로 전체 검증을 실행합니다.

```sh
npm run check
```

ESLint → Vitest → 프로덕션 빌드 → 빌드 HTML·정적 파일 검사를 순서대로 실행합니다. GitHub Actions 워크플로는 사용하지 않으므로 검증은 직접 실행합니다.

| 명령 | 역할 |
| --- | --- |
| `npm run lint` | ESLint 검사 |
| `npm test` | 단위·통합 테스트 실행 |
| `npm run build` | `dist` 폴더에 배포 파일 생성 |
| `npm run check:build` | 생성된 빌드 HTML·정적 파일 확인 |
| `npm run preview` | 빌드 결과를 로컬 서버에서 확인 |

현재 자동 테스트 101개와 빌드 검증을 통과했습니다. 가상 DOM 테스트 외에 실제 브라우저의 이미지 선택·달력·모달·모바일 화면 확인도 필요합니다.

## 주요 경로

| 화면 | 경로 |
| --- | --- |
| 온보딩 | `/` |
| 홈 대시보드 | `/home` |
| 관리 대상 목록 | `/items` |
| 관리 대상 추가 | `/items/new` |
| 관리 대상 상세 | `/items/:itemId` |
| 관리 대상 수정 | `/items/:itemId/edit` |
| 관리 완료 기록 | `/items/:itemId/record` |
| 전체 히스토리 | `/history` |
| 관리 기록 수정 | `/history/:historyId/edit` |

미완료 사용자는 온보딩으로, 완료 사용자가 `/`에 접근하면 홈으로 이동합니다. 기존 `/onboarding` 주소는 `/`로 연결되며, 일치하지 않는 경로는 404 화면을 표시합니다.

## Vercel 배포

로컬 검증을 마친 뒤 사용자가 Vercel에서 저장소를 연결해 배포합니다. 프로젝트 루트의 `vercel.json`이 다음 설정을 지정합니다.

| 설정 | 값 |
| --- | --- |
| Framework | Vite |
| Node.js | 22.x (`package.json` 기준) |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

SPA rewrite를 포함해 상세 URL 직접 접속과 새로고침을 지원하도록 구성했습니다. Vercel에서는 빌드만 실행하므로 테스트는 배포 전에 `npm run check`로 확인합니다. 현재 필수 환경 변수는 없습니다.

## 데이터 저장 안내

사용자 데이터는 브라우저의 localStorage에 저장합니다. 기본 콘텐츠와 사용자 데이터는 분리하며, 마지막 관리일·다음 관리일·상태는 기록과 주기에서 계산합니다.

- 저장된 데이터는 같은 브라우저·같은 사이트 주소에서 다시 사용할 수 있습니다.
- 개발 서버, 로컬 미리보기, Vercel 배포 주소는 저장소를 공유하지 않습니다.
- 브라우저 데이터를 삭제하면 사용자 기록도 삭제됩니다.
- 로그인·서버 저장·기기 간 동기화·클라우드 백업은 제공하지 않습니다.

## 관련 문서

- [서비스 기획](src/docs/SERVICE_PLAN.md)
- [사용자 흐름](src/docs/USER_FLOW.md)
- [기능 명세](src/docs/FUNCTIONAL_SPEC.md)
- [아키텍처](src/docs/ARCHITECTURE.md)
- [검증 결과와 수동 확인 목록](src/docs/TEST_REPORT.md)
- [Vercel 배포 절차](src/docs/DEPLOYMENT.md)
