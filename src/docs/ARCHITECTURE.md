# ARCHITECTURE.md

# 자취방 설명서 — 시스템 아키텍처 설계서

## 1. 문서 개요

### 1.1 목적

본 문서는 자취방 설명서 웹서비스의 기술 스택, 프로젝트 구조, 데이터 모델, 상태 관리 방식, 저장소 구조, 라우팅 및 비즈니스 로직을 정의한다.

AI Vibe Coding을 활용한 개인 프로젝트이므로 구현 복잡도를 최소화하면서도 유지보수와 기능 검증이 가능한 구조를 목표로 한다.

### 1.2 서비스 개요

자취방 설명서는 처음 자취하는 사용자가 집 안에서 관리해야 할 항목을 발견하고 관리 주기를 설정하며 관리 이력을 기록할 수 있도록 돕는 웹서비스이다.

핵심 기능은 다음과 같다.

- F01. 관리 대상 등록
- F02. 관리 주기 관리
- F03. 관리 히스토리

### 1.3 개발 원칙

1. 개인 프로젝트에서 구현 가능한 규모를 유지한다.
2. 모바일 환경을 우선 고려한다.
3. 기본 콘텐츠와 사용자 데이터를 분리한다.
4. 관리 일정은 저장된 데이터로부터 계산한다.
5. 핵심 비즈니스 로직은 UI와 분리한다.
6. AI가 생성한 코드를 이해하고 수정하며 테스트한다.
7. 초기 버전에서는 서버와 로그인 기능을 구현하지 않는다.

---

## 2. 기술 스택

| 구분         | 기술                     | 사용 목적                |
| ------------ | ------------------------ | ------------------------ |
| 프론트엔드   | React                    | 사용자 인터페이스 구현   |
| 언어         | JavaScript               | 애플리케이션 개발        |
| 빌드 도구    | Vite                     | 개발 서버 및 빌드        |
| 스타일링     | Tailwind CSS             | UI 스타일 및 반응형 구현 |
| 라우팅       | React Router             | 페이지 이동              |
| 상태 관리    | React Context + useState | 공유 데이터 관리         |
| 데이터 저장  | localStorage             | 사용자 데이터 영속화     |
| 테스트       | Vitest                   | 핵심 로직 검증           |
| AI 개발 도구 | Codex                    | 코드 생성 및 수정        |
| 디자인       | Figma                    | UI 설계                  |
| 배포         | Vercel                   | 웹서비스 배포            |

TypeScript는 사용하지 않는다.

초기 버전에서는 백엔드 서버와 데이터베이스를 사용하지 않는다.

---

## 3. 시스템 구조

애플리케이션은 다음 네 계층으로 구분한다.

### 3.1 Presentation Layer

사용자에게 화면을 표시하고 입력을 받는 계층이다.

주요 구성 요소:

- Page
- Component
- Layout

역할:

- 화면 렌더링
- 사용자 입력 처리
- 페이지 이동
- 상태에 따른 UI 표시

비즈니스 로직이나 localStorage 접근을 직접 구현하지 않는다.

### 3.2 State Layer

React Context를 통해 공유 상태를 관리한다.

주요 역할:

- 공간 목록 관리
- 사용자 관리 항목 목록 관리
- 관리 기록 목록 관리
- 데이터 추가·수정·삭제 후 화면 갱신
- 초기 데이터 로딩 상태 관리

### 3.3 Service Layer

관리 일정과 상태 계산 등 비즈니스 로직을 담당한다.

주요 역할:

- 마지막 관리일 계산
- 다음 관리일 계산
- 관리 상태 판별
- 관리 항목 우선순위 정렬
- 날짜 유효성 검사

가능한 한 순수 함수로 구현한다.

### 3.4 Repository Layer

localStorage와의 데이터 입출력을 담당한다.

주요 역할:

- 데이터 조회
- 데이터 저장
- 데이터 수정
- 데이터 삭제
- 저장된 데이터의 형식 검증
- 저장 오류 처리

향후 서버나 데이터베이스를 도입할 경우 Repository 구현을 교체할 수 있도록 설계한다.

---

## 4. 프로젝트 폴더 구조

```text
src/
├── app/
│   └── AppRouter.jsx
│
├── pages/
│   ├── OnboardingPage.jsx
│   ├── HomePage.jsx
│   ├── ItemsPage.jsx
│   ├── ItemDetailPage.jsx
│   ├── ItemFormPage.jsx
│   ├── RecordPage.jsx
│   ├── HistoryPage.jsx
│   ├── HistoryEditPage.jsx
│   └── NotFoundPage.jsx
│
├── features/
│   ├── onboarding/
│   ├── spaces/
│   ├── items/
│   └── histories/
│
├── components/
│   ├── layout/
│   └── ui/
│
├── contexts/
│   └── AppDataContext.jsx
│
├── repositories/
│   ├── spaceRepository.js
│   ├── itemRepository.js
│   ├── historyRepository.js
│   └── onboardingRepository.js
│
├── services/
│   └── maintenanceService.js
│
├── data/
│   ├── defaultSpaces.js
│   └── defaultItems.js
│
├── utils/
│   └── date.js
│
├── docs/
│   ├── SERVICE_PLAN.md
│   ├── USER_FLOW.md
│   ├── FUNCTIONAL_SPEC.md
│   ├── ARCHITECTURE.md
│   └── CONTENT_SPEC.md
│
├── App.jsx
└── main.jsx
```

기능별 컴포넌트는 features 폴더에 배치하고 여러 기능에서 사용하는 UI는 components 폴더에 배치한다.

---

## 5. 데이터 모델

### 5.1 기본 콘텐츠와 사용자 데이터의 구분

기본 콘텐츠는 서비스에서 제공하는 관리 항목 템플릿이다.

사용자 데이터는 사용자가 실제로 등록하고 관리하는 항목이다.

두 데이터는 서로 독립적으로 관리한다.

기본 콘텐츠는 JavaScript 파일에서 관리하며 사용자 데이터는 localStorage에 저장한다.

### 5.2 기본 공간 — DefaultSpace

```js
{
  id: "kitchen",
  name: "주방"
}
```

기본 공간은 총 5개이다.

- kitchen: 주방
- bathroom: 욕실
- laundry: 세탁 공간
- living: 생활 공간
- entrance: 현관

기본 공간 목록은 `defaultSpaces.js`에서 관리한다.

### 5.3 기본 관리 항목 — DefaultItem

```js
{
  id: "living-ac-filter",
  spaceId: "living",
  name: "에어컨 필터 청소",
  category: "cleaning",
  description: "필터에 쌓인 먼지를 제거해 공기 흐름을 유지합니다.",
  recommendedIntervalDays: 14,
  intervalSourceType: "official",
  intervalNote: "제품과 사용 환경에 따라 달라질 수 있습니다.",
  sourceName: "LG전자",
  sourceUrl: "https://www.lge.co.kr/story/faq/air-conditioners-faq"
}
```

필드 설명:

| 필드                    | 타입             | 설명                              |
| ----------------------- | ---------------- | --------------------------------- |
| id                      | string           | 기본 콘텐츠 ID                    |
| spaceId                 | string           | 소속 기본 공간 ID                 |
| name                    | string           | 관리 항목 이름                    |
| category                | string           | cleaning, inspection, replacement |
| description             | string           | 관리 필요성                       |
| recommendedIntervalDays | number 또는 null | 기본 권장 주기                    |
| intervalSourceType      | string 또는 null | official, suggested 또는 null     |
| intervalNote            | string           | 주기 적용 조건 및 안내            |
| sourceName              | string 또는 null | 참고 자료 출처                    |
| sourceUrl               | string 또는 null | 참고 자료 URL                     |

`recommendedIntervalDays`는 공식 안내 또는 서비스 참고 주기를 나타낸다.

`intervalSourceType`은 다음과 같이 사용한다.

- official: 제조사 또는 전문기관 안내 기반
- suggested: 서비스에서 제안한 참고값
- null: 공통 주기 미설정

기본 콘텐츠는 총 22개이다.

### 5.4 사용자 공간 — Space

```js
{
  id: "kitchen",
  name: "주방"
}
```

사용자가 직접 추가한 공간 예시:

```js
{
  id: "space-custom-001",
  name: "베란다"
}
```

필드 설명:

| 필드 | 타입   | 설명         |
| ---- | ------ | ------------ |
| id   | string | 공간 고유 ID |
| name | string | 공간 이름    |

기본 공간을 선택한 경우 기본 공간의 ID를 그대로 사용한다.

사용자 지정 공간은 중복되지 않는 별도 ID를 사용한다.

사용자 공간 목록은 실제로 등록한 공간만 포함한다.

### 5.5 사용자 관리 항목 — Item

```js
{
  id: "item-001",
  templateId: "living-ac-filter",
  spaceId: "living",
  name: "에어컨 필터 청소",
  intervalDays: 14,
  modelName: "",
  specification: "",
  image: null,
  memo: "",
  createdAt: "2026-11-04T09:00:00.000Z"
}
```

필드 설명:

| 필드          | 타입             | 설명                     |
| ------------- | ---------------- | ------------------------ |
| id            | string           | 사용자 관리 항목 고유 ID |
| templateId    | string 또는 null | 기본 콘텐츠 ID           |
| spaceId       | string           | 사용자 공간 ID           |
| name          | string           | 관리 항목 이름           |
| intervalDays  | number 또는 null | 실제 관리 주기           |
| modelName     | string           | 제품 또는 모델명         |
| specification | string           | 제품 규격 등 추가 정보   |
| image         | string 또는 null | 이미지 참조 정보         |
| memo          | string           | 사용자 메모              |
| createdAt     | string           | 생성 시각                |

#### templateId 정책

- 기본 콘텐츠를 선택한 경우 해당 콘텐츠의 ID를 저장한다.
- 직접 추가한 관리 항목은 null을 저장한다.
- 기본 콘텐츠의 설명과 출처는 templateId를 통해 조회한다.
- templateId는 사용자 관리 항목의 id와 구분한다.

#### intervalDays 정책

- 기본 콘텐츠 등록 시 recommendedIntervalDays를 초기값으로 복사한다.
- 사용자는 intervalDays를 변경할 수 있다.
- 기본 권장 주기가 변경되어도 기존 사용자 설정을 자동으로 덮어쓰지 않는다.
- intervalDays는 양의 정수 또는 null이다.
- null은 관리 주기가 미설정된 상태를 의미한다.

#### 계산 데이터 정책

Item에는 다음 값을 저장하지 않는다.

- lastManagedDate
- nextDueDate
- status

이 값들은 관리 기록과 관리 주기를 이용해 계산한다.

### 5.6 관리 기록 — History

```js
{
  id: "history-001",
  itemId: "item-001",
  managedAt: "2026-11-04",
  type: "completed",
  productUsed: "",
  memo: "",
  createdAt: "2026-11-04T09:00:00.000Z"
}
```

필드 설명:

| 필드        | 타입   | 설명                       |
| ----------- | ------ | -------------------------- |
| id          | string | 관리 기록 고유 ID          |
| itemId      | string | 연결된 사용자 관리 항목 ID |
| managedAt   | string | 실제 관리 날짜             |
| type        | string | initial 또는 completed     |
| productUsed | string | 사용 제품 또는 부품        |
| memo        | string | 관리 메모                  |
| createdAt   | string | 기록 생성 시각             |

#### 기록 유형

- initial: 온보딩 또는 등록 과정에서 입력한 기존 관리일
- completed: 서비스에서 실제 관리 완료를 기록한 경우

#### 날짜 정책

- managedAt은 YYYY-MM-DD 형식이다.
- 미래 날짜는 입력할 수 없다.
- 동일한 날짜에 여러 기록을 등록할 수 있다.
- 기록마다 고유한 ID를 부여한다.

### 5.7 온보딩 상태 — Onboarding

```js
{
  completed: false,
  currentStep: "spaces",
  selectedSpaceIds: [],
  draft: {}
}
```

필드 설명:

| 필드             | 타입    | 설명                  |
| ---------------- | ------- | --------------------- |
| completed        | boolean | 온보딩 완료 여부      |
| currentStep      | string  | 현재 진행 단계        |
| selectedSpaceIds | array   | 선택한 공간 ID        |
| draft            | object  | 진행 중인 입력 데이터 |

온보딩 상태는 단계 이동 시 자동 저장한다.

새로고침하거나 브라우저를 다시 열어도 이어서 진행할 수 있도록 한다.

---

## 6. 데이터 관계

### 6.1 Space와 Item

- 하나의 Space는 여러 Item을 가질 수 있다.
- 하나의 Item은 하나의 Space에 속한다.
- Item.spaceId는 존재하는 사용자 Space의 ID를 참조한다.

### 6.2 DefaultItem과 Item

- 하나의 DefaultItem을 참조하는 사용자 Item이 존재할 수 있다.
- Item.templateId는 DefaultItem.id를 참조한다.
- 사용자 지정 Item은 templateId가 null이다.
- 기본 콘텐츠를 변경하더라도 사용자 Item의 설정값은 유지한다.

### 6.3 Item과 History

- 하나의 Item은 여러 History를 가질 수 있다.
- 하나의 History는 하나의 Item에 속한다.
- History.itemId는 Item.id를 참조한다.
- Item을 삭제하면 연결된 History도 삭제한다.
- 삭제 전 사용자에게 확인을 요청한다.

---

## 7. localStorage 구조

다음 키를 사용한다.

```text
homeguide:spaces
homeguide:items
homeguide:histories
homeguide:onboarding
```

### 7.1 저장 정책

- 기본 콘텐츠는 localStorage에 중복 저장하지 않는다.
- 사용자가 선택한 공간과 관리 항목만 저장한다.
- 관리 기록은 별도 배열로 저장한다.
- 모든 저장 데이터는 JSON 형식으로 직렬화한다.
- 데이터 읽기 및 쓰기는 Repository 계층에서 수행한다.

### 7.2 저장 오류

다음 상황을 고려한다.

- localStorage 접근 실패
- 잘못된 JSON 데이터
- 저장 공간 부족
- 예상하지 못한 데이터 형식

오류가 발생하면 애플리케이션이 중단되지 않도록 처리하고 사용자에게 필요한 안내를 표시한다.

온보딩 완료 저장 중에는 `homeguide:pending-onboarding`에 네 키의 이전 원본을 보관한다. 네 키 저장 및 복구 키 제거까지 성공해야 완료로 처리한다. 실패 또는 실행 중단 시 이전 원본을 복구하며, 복구가 불가능하면 정보를 보존하고 로딩 오류를 안내한다.

관리 대상의 추가·수정·연관 기록 삭제도 동일한 복구 절차를 사용하며 공통 키 `homeguide:pending-data`에 이전 원본을 임시 보관한다. 두 복구 키는 앱 초기 로딩에서 모두 확인한다.

### 7.3 데이터 영속성 한계

localStorage는 브라우저와 기기에 종속된다.

브라우저 데이터를 삭제하거나 다른 기기에서 접속하면 기존 데이터가 유지되지 않을 수 있다.

초기 버전에서는 계정 동기화와 클라우드 백업을 제공하지 않는다.

---

## 8. 상태 관리 구조

React Context와 useState를 사용한다.

### 8.1 AppDataContext

관리 대상:

- spaces
- items
- histories
- onboarding
- isLoading

제공할 주요 기능:

- addSpace
- updateSpace
- deleteSpace
- addItem
- updateItem
- deleteItem
- addHistory
- updateHistory
- deleteHistory
- updateOnboarding
- completeOnboarding

현재 기능 개발 2단계에서는 `AppDataProvider`와 `useAppData`로 데이터 로딩 및 `saveResource(resource, value)`를 연결했다. 저장 성공 이후에만 공유 상태를 갱신하며, 로딩 오류 시 원본을 보존하고 재시도를 제공한다. 온보딩은 3단계에서 `completeOnboarding(wizard)`로 일괄 저장했다. 4단계에서 `addItem`, `updateItem`, `deleteItem`을 연결했으며, 항목과 새 공간 및 연관 기록은 함께 저장한다. 6단계에서 `addHistory`, `updateHistory`, `deleteHistory`도 연결했다. 기록 배열 키의 쓰기 성공 이후에만 공유 상태를 갱신하며 일정은 원본으로부터 다시 계산한다.

조회 화면은 Context 데이터를 사용한다. 디자인 예시는 명시적인 개발용 preview 경로에 한정한다. 5단계에서 maintenanceService와 달력 날짜 유틸리티를 연결했다. 홈·목록·상세는 원본 기록 및 사용자 주기로 마지막 관리일·다음 관리일·상태를 계산하고 우선순위로 정렬한다. 오늘 날짜가 바뀌어도 다시 계산하며 파생 값은 저장하지 않는다.

### 8.2 상태 변경 흐름

```text
사용자 입력
    ↓
Page / Component
    ↓
Context Action
    ↓
Repository
    ↓
localStorage
    ↓
Context State 갱신
    ↓
화면 다시 렌더링
```

Repository 저장이 실패한 경우 성공한 것으로 표시하지 않는다.

### 8.3 파생 데이터

마지막 관리일, 다음 관리일, 관리 상태는 원본 상태에서 계산한다.

필요한 경우 useMemo를 사용해 불필요한 재계산을 줄일 수 있다.

---

## 9. 관리 일정 계산

### 9.1 마지막 관리일

해당 Item에 연결된 History 중 가장 최근 managedAt을 사용한다.

```text
lastManagedDate = MAX(History.managedAt)
```

기록이 없다면 null이다.

### 9.2 다음 관리일

```text
nextDueDate = lastManagedDate + intervalDays
```

다음 조건 중 하나라도 해당하면 null이다.

- 마지막 관리일이 없음
- 관리 주기가 없음

### 9.3 관리 상태

| 상태      | 조건                         |
| --------- | ---------------------------- |
| 관리 지연 | 다음 관리일이 오늘 이전      |
| 오늘 관리 | 다음 관리일이 오늘           |
| 관리 임박 | 1~7일 남음                   |
| 관리 예정 | 8일 이상 남음                |
| 미설정    | 다음 관리일을 계산할 수 없음 |

### 9.4 정렬 우선순위

1. 관리 지연
2. 오늘 관리
3. 관리 임박
4. 관리 예정
5. 미설정

같은 상태에서는 다음 관리일이 빠른 항목을 먼저 표시한다.

미설정 항목은 별도 영역으로 표시할 수 있다.

### 9.5 날짜 계산 기준

- 날짜 계산은 사용자의 로컬 달력 날짜를 기준으로 한다.
- 관리일과 마감일은 시각이 아닌 날짜 단위로 비교한다.
- 날짜 계산 과정에서 시간대 변환으로 하루가 변경되지 않도록 구현한다.
- 날짜 문자열을 단순히 UTC 시각으로 변환해 계산하지 않는다.

---

## 10. 관리 기록 변경 정책

### 10.1 기록 추가

- 관리일은 필수이다.
- 사용 제품 및 메모는 선택이다.
- 등록 즉시 관리 일정에 반영한다.

### 10.2 기록 수정

- 관리 날짜를 수정하면 마지막 관리일을 다시 계산한다.
- 제품 정보나 메모만 수정한 경우 날짜 계산 결과는 유지된다.

### 10.3 기록 삭제

- 삭제한 기록이 최신 기록이었다면 남은 기록 중 최신 날짜를 사용한다.
- 모든 기록이 삭제되면 마지막 관리일과 다음 관리일은 미설정이 된다.
- 삭제 전 확인 절차를 제공한다.

### 10.4 중복 기록

동일한 날짜에 여러 관리 기록을 저장할 수 있다.

단 버튼 중복 클릭으로 동일한 요청이 반복 저장되는 상황은 방지한다.

---

## 11. 라우팅 구조

| 경로                     | 페이지          | 기능             |
| ------------------------ | --------------- | ---------------- |
| /                        | OnboardingPage  | 초기 설정 시작 및 4단계 진행 |
| /home                    | HomePage        | 관리 대시보드    |
| /items                   | ItemsPage       | 전체 관리 대상   |
| /items/new               | ItemFormPage    | 관리 대상 추가   |
| /items/:itemId           | ItemDetailPage  | 관리 대상 상세   |
| /items/:itemId/edit      | ItemFormPage    | 관리 대상 수정   |
| /items/:itemId/record    | RecordPage      | 관리 완료 기록   |
| /history                 | HistoryPage     | 전체 관리 기록   |
| /history/:historyId/edit | HistoryEditPage | 관리 기록 수정   |
| \*                       | NotFoundPage    | 잘못된 경로 안내 |

`/`에서 온보딩 시작 → 공간 선택 → 공간별 관리 항목 발견 → 관리 주기 설정을 진행하고, 설정 완료 버튼으로 `/home`에 진입한다. 온보딩 단계는 현재 화면 내부 상태로 전환한다.

기존 `/onboarding` 주소는 검색 매개변수와 해시를 유지하며 `/`로 리다이렉트한다. 잘못된 상세·수정 ID는 해당 화면에서 찾을 수 없음 안내를 표시하고, 일치하는 경로가 없으면 404를 표시한다.

### 11.1 접근 제어 (기능 구현 단계의 정책)

- 온보딩을 완료하지 않았다면 `/`로 이동한다.
- 온보딩을 완료했다면 `/` 접근 시 `/home`으로 이동한다.
- 저장 데이터 로딩이 완료되기 전에는 리다이렉트 여부를 결정하지 않는다.

기능 개발 3단계에서 완료 상태 저장과 자동 접근 제어를 연결했다. 개발용으로 명시한 디자인 미리보기는 예외로 접근할 수 있으며 사용자 데이터를 저장하지 않는다.

### 11.2 내비게이션

모바일 하단 내비게이션은 다음 세 가지로 구성한다.

- 홈
- 관리 대상
- 히스토리

---

## 12. 핵심 사용자 흐름

### 12.1 최초 이용

```text
서비스 접속
→ 공간 선택
→ 공간별 관리 항목 선택
→ 관리 주기 및 마지막 관리일 설정
→ 온보딩 완료
→ 홈
```

### 12.2 관리 대상 추가

```text
관리 대상 목록
→ 관리 대상 추가
→ 기본 항목 선택 또는 직접 입력
→ 관리 주기 설정
→ 저장
→ 목록 갱신
```

### 12.3 관리 완료

```text
홈 또는 관리 대상 상세
→ 관리 완료
→ 관리 날짜 입력
→ 선택 정보 입력
→ 기록 저장
→ 다음 관리일 재계산
```

### 12.4 관리 기록 수정

```text
히스토리
→ 기록 선택
→ 기록 수정
→ 저장
→ 관리 일정 재계산
```

---

## 13. 테스트 전략

### 13.1 자동 테스트

Vitest를 사용해 다음 로직을 검증한다.

- 마지막 관리일 계산
- 다음 관리일 계산
- 관리 상태 판별
- 날짜 경계 처리
- 기록 추가 후 재계산
- 기록 수정 후 재계산
- 기록 삭제 후 재계산
- 주기 미설정 처리

### 13.2 수동 테스트

브라우저에서 다음 항목을 확인한다.

- 온보딩 진행
- 온보딩 자동 저장
- 관리 항목 추가 및 수정
- 관리 기록 추가 및 수정
- 관리 항목 삭제
- 새로고침 후 데이터 유지
- 모바일 화면
- 잘못된 URL 접근
- 입력값 오류 처리

### 13.3 검증 기록

AI가 생성한 코드를 그대로 수용하지 않고 다음 사항을 기록한다.

- AI에 요청한 내용
- 생성된 코드의 핵심 동작
- 직접 확인한 문제
- 수정한 내용
- 테스트 결과

---

## 14. 개발 단계

### Phase 1. 프로젝트 기반 구축

- Vite 프로젝트 생성
- Tailwind CSS 설정
- React Router 설정
- 폴더 구조 생성
- 기본 콘텐츠 연결
- Repository 및 Context 기반 구현

### Phase 2. F01 관리 대상 등록

- 공간 선택
- 기본 항목 선택
- 사용자 지정 항목 등록
- 온보딩
- 관리 항목 수정 및 삭제

### Phase 3. F02 관리 주기 관리

- 관리 주기 설정
- 마지막 관리일 계산
- 다음 관리일 계산
- 관리 상태 표시
- 홈 대시보드

### Phase 4. F03 관리 히스토리

- 관리 완료 기록
- 기록 목록
- 기록 수정 및 삭제
- 일정 재계산

### Phase 5. 통합 및 배포

- 기능 통합 테스트
- 예외 상황 점검
- 반응형 UI 검증
- Vercel 배포

---

## 15. 추후 결정 사항

다음 항목은 실제 구현 단계에서 상세 정책을 확정한다.

1. 사용자 공간 삭제 시 연결된 관리 항목 처리
2. 이미지 업로드 및 저장 방식
3. 기존 기본 항목의 이름 변경 시 templateId 유지 여부
4. 저장 데이터 구조 변경 시 마이그레이션 방식
5. localStorage 오류 발생 시 사용자 복구 안내

핵심 기능 구현에 영향을 주는 정책은 해당 기능 개발 전에 확정한다.

## 현재 통합 검증 및 배포 준비

7단계에서 Vitest/Testing Library 가상 DOM 통합 테스트와 `npm run check`, 빌드 파일 검사 및 GitHub Actions 검증 설정을 추가했다. Vercel SPA rewrite와 Node 22 설정을 제공한다. 실제 브라우저 확인 및 외부 배포 결과는 TEST_REPORT.md와 DEPLOYMENT.md를 참고한다. 외부 배포는 사용자가 직접 진행한다.
