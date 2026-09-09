# 322

## 网站与服务器

网站源码位于 `_source`，部署到 Vercel；用户注册接口和 PostgreSQL 部署配置位于 `server` 与 `docker-compose.yml`，用于部署到腾讯云轻量服务器。

注册资料通过 `/api/auth/register` 保存到 PostgreSQL，密码只保存哈希值。生产环境需要在服务器创建 `.env`，并在 Vercel 项目中设置 `API_SERVER_URL` 指向腾讯云 API 地址。
