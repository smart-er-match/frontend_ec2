## Nginx 배포 메모

프론트엔드 정적 리소스를 Nginx로 배포하면서 백엔드(프라이빗 IP)로의 API 요청을 프록시하는 전체 과정을 정리했습니다. SSH로 접속해 `ubuntu` 사용자 기준으로 작업했습니다.

### 1. Nginx 설치
```bash
sudo apt update
sudo apt install -y nginx
```

### 2. 빌드 결과 배치
1. 프로젝트에서 `npm run build` 실행 → `dist/` 생성.
2. 정적 파일을 Nginx가 접근 가능한 경로로 복사 (`/var/www/app` 사용).
   ```bash
   sudo mkdir -p /var/www/app
   sudo rsync -av --delete dist/ /var/www/app/
   sudo chown -R www-data:www-data /var/www/app
   ```

### 3. Nginx 설정
`/etc/nginx/sites-available/default` 내용을 다음처럼 수정.

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    root /var/www/app;
    index index.html;

    # SPA 라우팅 처리
    location / {
        try_files $uri $uri/ /index.html;
    }

    # /api → 내부 백엔드 프록시
    location /api/ {
        proxy_pass http://172.31.20.115/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

설정 후:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 4. 프론트엔드 설정
- `axios` 기본 URL을 `/api`로 변경하여 항상 동일한 경로를 사용.
- 개발용 Vite 서버에서도 `server.proxy`로 `/api`를 내부 백엔드에 연결하면 코드 변경 없이 동일하게 동작.

### 5. Django 환경 변수
프론트 주소가 `15.164.214.255`이므로 백엔드 `.env`에 다음을 추가해야 함.
- `DJANGO_ALLOWED_HOSTS`: `15.164.214.255`
- `DJANGO_TRUSTED_ORIGINS`: `http://15.164.214.255`
- `CORS_ALLOWED_ORIGINS`: `http://15.164.214.255`

변경 후 백엔드 서비스를 재시작.

### 6. 배포 스크립트
`package.json`에 `deploy` 스크립트 추가:
```jsonc
"deploy": "npm run build && sudo rsync -av --delete dist/ /var/www/app/ && sudo systemctl reload nginx"
```
배포 시:
```bash
npm run deploy
```

이 과정으로 정적 프론트는 Nginx가 퍼블릭에서 서빙하고, `/api` 요청은 내부 백엔드로 안전하게 프록시된다.
