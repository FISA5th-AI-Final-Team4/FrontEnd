# 챗봇의 정석 FrontEnd

| 소개 | 관련 링크 |
| ------ | ------ |
| 챗봇의 정석의 얼굴이 되는 **클라이언트 화면 원격 저장소** 입니다. <br>웹소켓을 이용한 백엔드 통신에 기반하여, 질문 프리셋, 챗봇 응답 피드백 기능을 지원합니다.<br>**커스텀 JSON 프로토콜**을 파싱하여 MCP 기능별로 서비스 이용에 필요한 UI를 제공합니다.<br>**단순한 SPA**임을 고려하여 NextJS가 아닌 **ReactJS**를 개발 스택으로 선정했습니다. | 🔗[챗봇의 정석 프로젝트 설명 페이지](https://github.com/FISA5th-AI-Final-Team4) <br>🔗[BackEnd 원격 저장소](https://github.com/FISA5th-AI-Final-Team4/BackEnd) <br>🔗[LLM서버 원격 저장소](https://github.com/FISA5th-AI-Final-Team4/LLMServer) <br>🔗[MCP서버 원격 저장소](https://github.com/FISA5th-AI-Final-Team4/MCPServer) <br>🔗[DB서버 원격 저장소](https://github.com/FISA5th-AI-Final-Team4/LocalDbSetup) |


## ✨ 주요 기능
- **실시간 채팅**: WebSocket 통신, 재연결 버튼

- **질문 프리셋**: 서비스 이용에 필요한 질문 버튼 제공

- **챗봇 응답 로딩 UI**: 챗봇 응답 생성 중 로딩 UI 표시

- **챗봇 응답 피드백**: 챗봇 응답의 품질 개선을 위한 사용자 피드백 데이터 수집

- **사용자 페르소나 선택**: 로그인 기능을 대체하는 로그인 UI

- **카드 상품 UI**: 카드 상품 설명 페이지로 리다이렉트되는 카드 이미지 표시

- **반응형 UI**: 두 개의 분기점을 사용하여 데스크탑 모니터 / 노트북 / 모바일 지원

## ⚒️ 기술 스택
- React 19 + Vite

  <img src="https://img.shields.io/badge/ReactJS-61DAFB?style=for-the-badge&logo=React&logoColor=black"/> <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=Vite&logoColor=FFCF27">

- CSS Modules

  <img src="https://img.shields.io/badge/CSSModules-000000?style=for-the-badge&logo=CSSModules&logoColor=White"/>

- CloudFlare + Nginx + Jenkins

  <img src="https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=cloudflare&logoColor=black"/> <img src="https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=Nginx&logoColor=black"/> <img src="https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=Jenkins&logoColor=FFFFFF">

- Route53 + CloudFront + S3

  <img src="https://img.shields.io/badge/AWS Route53-6C5893?style=for-the-badge"/> <img src="https://img.shields.io/badge/AWS CloudFront-E4533E?style=for-the-badge"/> <img src="https://img.shields.io/badge/AWS S3-3F8624?style=for-the-badge"/>


## 📁 프로젝트 구조

```bash
.
├── Jenkinsfile                    # Jenkins CI/CD 파이프라인 설정
├── index.html                     # Vite SPA 엔트리 HTML
├── package.json                   # 프로젝트 의존성 및 스크립트
├── public                         # 정적 파일
│   ├── favicon.ico
│   └── vite.svg
├── src                            # 프론트엔드 소스코드
│   ├── App.css                    # App 전역 스타일
│   ├── App.jsx                    # 루트 App 컴포넌트
│   ├── assets                     # 정적 데이터 및 이미지
│   │   ├── card_ids.json          # 카드 ID - 카드명 매핑 JSON
│   │   ├── cards                  # 카드 상품 이미지
│   │   ├── icons                  # UI SVG 아이콘
│   │   ├── images                 # 기타 이미지
│   │   └── react.svg
│   ├── components                 # UI 컴포넌트
│   │   ├── CardListBubble.jsx     # 카드 목록 UI 버블
│   │   ├── ChatFooter.jsx         # 채팅창 하단 입력창 UI
│   │   ├── ChatHeader.jsx         # 채팅창 헤더 UI
│   │   ├── ChatMessage.jsx        # 메시지 버블 UI
│   │   ├── LoginBubble.jsx        # 로그인 안내 버블
│   │   ├── Menu.jsx               # 햄버거 메뉴 UI
│   │   ├── MenuItem.jsx           # 메뉴 항목
│   │   ├── MenuSection.jsx        # 메뉴 섹션
│   │   ├── PersonaCard.jsx        # 페르소나 선택 카드
│   │   ├── QuestionBubble.jsx     # 관련 질문 버블 UI
│   │   └── *.module.css           # 컴포넌트 단위 CSS Module 스타일
│   ├── index.css                  # 전역 스타일
│   ├── main.jsx                   # React 렌더링 엔트리
│   └── pages                      # 페이지 단위 컴포넌트
│       ├── ChatPage.jsx           # 채팅 페이지
│       ├── PersonaSelectPage.jsx  # 페르소나 선택 페이지
│       └── *.module.css           # 페이지 단위 CSS Module 스타일
├── .env.local                     # 시스템 환경변수 (직접 생성 & 작성 필요)
└── vite.config.js                 # Vite 빌드 및 개발 서버 설정
```

## ⚙️ 환경 변수 & 로컬 실행, 프로덕션 빌드
- 실행 환경
  - `Node.js >= 22`
  - `npm >= 11`

- 환경 변수 (`.env.local`)
    ```bash
    VITE_API_URL=http://127.0.0.1:8001 # 백엔드 배포 주소
    ```

- 로컬 실행
    ```bash
    npm install # 패키지 의존성 설치
    npm run dev # http://127.0.0.1:5173 브라우저 접속
    ```

- 배포 빌드
    ```bash
    npm install     # 패키지 의존성 설치
    npm run build   # 빌드 파일 생성
    npm run preview # 빌드 파일 확인 http://127.0.0.1:4173 브라우저 접속
    # ./dist/ 디렉토리에 빌드 결과물 정적 파일 확인
    ```


## ☁️ 온프레미스·AWS 배포 전략

| 항목       | 🖥️ 온프레미스         | ☁️ AWS            |
| -------- | ----------------- | ----------------- |
| **도메인**      | CloudFlare         | Route53           |
| **정적 파일 제공** | Nginx + Jenkins CI/CD             | S3 + CloudFront   |
| **백엔드 연결**   | 내부망 서버            | Public ALB ALB → Private EC2 그룹      |
| **장점**       | 내부망 보안, 폐쇄망 환경 호환 | 확장성, 고가용성, 관리 편의성 |
| **단점**       | 확장 어려움, 배포 자동화 부담 | 비용 발생, 설정 복잡      |
