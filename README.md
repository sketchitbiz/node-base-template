# Heredot 백엔드 서버 템플릿

Heredot는 Express.js 기반의 백엔드 서버 템플릿으로, 빠르고 효율적인 API 개발을 위한 기본 구조와 도구를 제공합니다.

## 주요 기능

- **Express.js 기반**: 빠르고 간결한 웹 애플리케이션 프레임워크
- **PostgreSQL 데이터베이스**: 강력한 관계형 데이터베이스 지원
- **Redis 캐싱**: 성능 향상을 위한 인메모리 데이터 저장소
- **JWT 인증**: JSON Web Token을 사용한 사용자 인증
- **Passport.js**: 다양한 인증 전략 지원
- **Winston 로깅**: 체계적인 로그 관리
- **Docker 지원**: 컨테이너화된 배포 환경
- **Prometheus 모니터링**: 애플리케이션 성능 지표 수집

## 시스템 요구사항

- Node.js 16.x 이상
- PostgreSQL 13.x 이상
- Redis 6.x 이상
- Docker (선택적 배포 옵션)

## 설치 방법

### 로컬 환경 설정

1. 저장소 클론

   ```bash
   git clone [저장소 URL]
   cd heredot
   ```

2. 의존성 설치

   ```bash
   npm install
   # 또는
   pnpm install
   ```

3. 환경 변수 설정
   `.env.example` 파일을 `.env`로 복사하고 필요한 환경 변수 값을 설정하세요.

   ```bash
   cp .env.example .env
   # .env 파일 편집
   ```

   주요 환경 변수:

   - `SERVER_TYPE`: 서버 타입 (APP, CMS)
   - `DB_USER`: PostgreSQL 사용자명
   - `DB_HOST`: PostgreSQL 호스트 주소
   - `DB_NAME`: 데이터베이스 이름
   - `DB_PASSWORD`: 데이터베이스 비밀번호
   - `PORT`: 데이터베이스 포트

### Docker를 사용한 설정 (옵션)

1. Docker 설치 (Ubuntu 기준)

   ```bash
   ./install_docker.sh
   ```

2. Docker 컨테이너 실행
   ```bash
   docker-compose up -d
   ```

## 실행 방법

### 개발 모드

```bash
npm start
# 또는
pnpm start
```

서버는 기본적으로 80번 포트에서 실행됩니다.

## 프로젝트 구조

```
heredot/
├── app.js                  # 애플리케이션 진입점
├── config/                 # 설정 파일
├── database/               # 데이터베이스 관련 코드
│   ├── DatabaseManager.js  # PostgreSQL 연결 관리
│   ├── RedisManager.js     # Redis 연결 관리
│   └── TransactionProxy.js # 트랜잭션 관리
├── modules/                # 비즈니스 로직 모듈
├── routes/                 # API 라우트 정의
│   └── UserRoutes.js       # 사용자 관련 라우트
├── util/                   # 유틸리티 함수
├── prometheus/             # Prometheus 모니터링 설정
└── log/                    # 로그 파일 디렉토리
```

## API 엔드포인트

### 사용자 관리

- `POST /api/users/join`: 사용자 등록
- `POST /api/users/login`: 사용자 로그인

## 인증

이 템플릿은 두 가지 인증 방식을 지원합니다:

1. **Local 인증**: 사용자명과 비밀번호를 사용한 기본 인증
2. **JWT 인증**: 로그인 후 발급된 토큰을 사용한 인증

## 모니터링 (현재 사용 X)

Prometheus 지표는 `/metrics` 엔드포인트에서 확인할 수 있습니다.


## 로깅

애플리케이션 로그는 `log/` 디렉토리에 저장됩니다. Winston 로거를 사용하여 로그 레벨에 따라 다양한 파일로 로그를 기록합니다.

