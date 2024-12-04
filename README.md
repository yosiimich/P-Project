# 로컬 환경 구축 방법

## 필독

- .gitignore 파일 절대 수정 금지

## database

- mysql 사용
- db.txt 한줄 씩 실행
- ./config/dbConnect.js 내용 변경
  - .env 파일 생성하여 진행
  - / 디렉토리에 생성하면 됨
  - ID, PW는 자신의 것 사용

  ```
  DB_CONNECT_ID = 
  DB_CONNECT_PW = 
  JWT_SECRET = 12345
  PORT= 60030
  ```

## npm

```
npm install
```

- 위 명령어 실행시 알아서 모듈 다운로드 됨
