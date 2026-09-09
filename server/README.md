# Quote Assistant API

在服务器上准备 Docker 和 Docker Compose 后：

```bash
cp server/.env.example .env
openssl rand -hex 32
sudo -v && curl -fsSL https://raw.githubusercontent.com/zhouyuliao/website-starter/main/server/bootstrap.sh | sudo bash
curl http://127.0.0.1:3001/healthz
```

脚本会自动检测当前 Ubuntu 软件源可用的 Compose 包，并兼容 `docker compose` 和 `docker-compose` 两种命令。

把生成的随机值分别填入 `POSTGRES_PASSWORD` 和 `JWT_SECRET`。API 默认监听 `3001`，数据库只在 Docker 内网提供，不对公网开放。
