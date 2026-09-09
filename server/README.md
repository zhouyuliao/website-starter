# Quote Assistant API

在服务器上准备 Docker 和 Docker Compose 后：

```bash
cp server/.env.example .env
openssl rand -hex 32
docker compose up -d --build
curl http://127.0.0.1:3001/healthz
```

把生成的随机值分别填入 `POSTGRES_PASSWORD` 和 `JWT_SECRET`。API 默认监听 `3001`，数据库只在 Docker 内网提供，不对公网开放。
