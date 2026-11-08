# Vercel 배포

외부 배포는 사용자가 직접 진행합니다. 이 작업에서는 프로젝트 생성·로그인·업로드·배포를 실행하지 않았습니다.

## 로컬 확인

```sh
npm ci
npm run check
npm run preview
```

실제 화면 확인 항목은 TEST_REPORT.md를 참고하세요. `vite preview`는 빌드의 로컬 확인용입니다.

## 프로젝트 설정

Vercel에서 이 저장소를 가져오고 다음 값을 확인합니다.

| 설정 | 값 |
| --- | --- |
| Framework Preset | Vite |
| Root Directory | 프로젝트 루트 |
| Node.js | 22.x |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| 환경 변수 | 현재 필수값 없음 |

`vercel.json`에 Vite 프리셋과 명령·출력 폴더 및 SPA rewrite를 지정했습니다. 실제 파일이 아닌 화면 경로도 `/index.html`로 진입하여 React Router가 처리합니다. [Vercel의 Vite SPA 안내](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas)를 기준으로 설정했습니다.

GitHub Actions 워크플로는 제거했습니다. 배포 전 로컬에서 `npm run check`를 직접 실행합니다. Vercel의 Build Command는 `npm run build`이므로 배포 과정에서 테스트가 자동 실행되지는 않습니다.

## 배포 후 확인

1. 배포 주소의 `/`에서 온보딩을 마치고 홈에 진입합니다.
2. `/home`, `/items`, `/history`, 실제 항목의 상세·수정·기록 URL을 주소창에 직접 입력하고 새로고침합니다.
3. 없는 URL은 서비스의 404 화면이 표시되는지 확인합니다.
4. 관리 항목과 기록을 저장하고 새로고침해 유지되는지 확인합니다.
5. 개발용 `/dev/ui`, `/dev/layout`, `preview-*` 예시 ID가 배포 환경에서 사용되지 않는지 확인합니다.
6. 콘솔 오류·정적 파일 404·모바일 배치를 확인합니다.

## 사용자 데이터

localStorage는 사이트 origin(프로토콜·호스트·포트)별로 다릅니다. 로컬 개발 주소와 Vercel Preview/Production 주소는 데이터를 공유하지 않습니다. 배포 URL이 바뀌면 기존 데이터가 보이지 않을 수 있으며 서버로 자동 이전되지 않습니다.
브라우저 데이터 삭제 시 사용자 기록도 사라집니다. 초기 버전은 로그인·기기 간 동기화·클라우드 백업을 제공하지 않습니다.
