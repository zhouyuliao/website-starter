# Quote Assistant API

在 Ubuntu 服务器上执行：

```bash
sudo -v && curl -fsSL https://raw.githubusercontent.com/zhouyuliao/website-starter/main/server/bootstrap.sh | sudo bash
curl http://127.0.0.1:3001/healthz
```

脚本使用 Ubuntu 软件源安装 PostgreSQL 和 Node.js，自动生成数据库密码与 JWT 密钥，并注册开机自动运行的 systemd 服务。API 默认监听 `3001`，PostgreSQL 只监听服务器本机。
