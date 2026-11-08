# 자취방 설명서

처음 자취하는 사용자가 집 안의 관리 항목을 발견하고, 관리 주기를 설정하고, 관리 기록을 남기는 웹서비스입니다. 대학 전공 수업의 개인 프로젝트입니다.

## 실행

Node.js 22.x와 npm을 사용합니다. `.nvmrc`를 제공하며, nvm 사용 시 `nvm use`로 맞출 수 있습니다.

```sh
npm ci
npm run dev
```

터미널에 표시된 주소를 브라우저에서 엽니다. 첫 접속은 `/`의 온보딩에서 시작하고 완료하면 `/home`으로 이동합니다.

## 검증 및 빌드

```sh
npm run check
```

ESLint → Vitest → 프로덕션 빌드 → 빌드 HTML·정적 파일 확인을 순서대로 실행합니다.

```sh
npm run preview
```

빌드 결과를 로컬에서 확인합니다. 개발 서버와 포트가 다르면 localStorage도 별개이므로 온보딩이 다시 표시될 수 있습니다.

## 구현 기능

- 4단계 온보딩, 초안 자동 저장·복원 및 완료 여부에 따른 라우팅
- 기본 공간 5개·관리 항목 22개, 사용자 지정 공간·항목
- 관리 대상 추가·수정·삭제, 제품 정보·이미지 저장
- 관리 주기·최근 기록으로 다음 관리일과 5개 관리 상태 계산
- 관리 기록 작성·수정·삭제, 항목별·전체 히스토리 조회
- 입력 검증, 저장 실패 안내, 중단된 일괄 저장 복구

기본 항목의 이름을 수정해도 안내 연결은 유지합니다. 사용자가 명시적으로 직접 등록 항목으로 전환하면 연결을 해제합니다.

## 주요 경로

| 화면 | 경로 |
| --- | --- |
| 온보딩 | `/` |
| 홈 | `/home` |
| 관리 대상 | `/items` |
| 추가 | `/items/new` |
| 상세·수정·기록 | `/items/:itemId`, `/items/:itemId/edit`, `/items/:itemId/record` |
| 히스토리·기록 수정 | `/history`, `/history/:historyId/edit` |

기존 `/onboarding`은 `/`로 이동합니다. 일치하지 않는 경로는 404 화면을 표시합니다.

## 기술 구성

React · JavaScript/JSX · Vite · Tailwind CSS · React Router · React Context/useState · localStorage · Vitest · Testing Library/jsdom

Repository가 저장소 접근, Service가 비즈니스 로직, Context가 공유 상태를 담당합니다. 백엔드·로그인·클라우드 동기화는 없습니다. 사용자 데이터는 기기·브라우저·사이트 주소에 종속됩니다.

## 테스트·배포 문서

- [검증 결과와 남은 수동 확인](src/docs/TEST_REPORT.md)
- [Vercel 배포 절차](src/docs/DEPLOYMENT.md)
- [기능 명세](src/docs/FUNCTIONAL_SPEC.md)
- [아키텍처](src/docs/ARCHITECTURE.md)

자동 테스트와 빌드 검증을 마쳤으며 실제 브라우저 화면 확인은 남아 있습니다. 외부 배포는 사용자가 직접 진행합니다.
