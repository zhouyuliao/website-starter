#!/usr/bin/env bash
set -eu

if [ "$(id -u)" -ne 0 ]; then
  echo "Run this script as root: curl ... | sudo bash" >&2
  exit 1
fi

APP_DIR=/opt/quote-assistant
REPO_URL=https://github.com/zhouyuliao/website-starter.git

apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y \
  ca-certificates curl git nodejs npm openssl postgresql
systemctl enable --now postgresql

if [ ! -d "$APP_DIR/.git" ]; then
  mkdir -p "$(dirname "$APP_DIR")"
  git clone "$REPO_URL" "$APP_DIR"
else
  git -C "$APP_DIR" fetch origin main
  git -C "$APP_DIR" reset --hard origin/main
fi

cd "$APP_DIR"
umask 077
if [ ! -f .env ]; then
  cat > .env <<EOF
POSTGRES_PASSWORD=$(openssl rand -hex 24)
JWT_SECRET=$(openssl rand -hex 32)
CORS_ORIGIN=https://website-starter-beige.vercel.app
EOF
fi

DB_PASSWORD=$(sed -n 's/^POSTGRES_PASSWORD=//p' .env)
runuser -u postgres -- psql -v ON_ERROR_STOP=1 -v app_password="$DB_PASSWORD" <<'SQL'
SELECT format('CREATE ROLE quote_app LOGIN PASSWORD %L', :'app_password')
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'quote_app') \gexec
ALTER ROLE quote_app PASSWORD :'app_password';
SELECT 'CREATE DATABASE quote_app OWNER quote_app'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'quote_app') \gexec
SQL

npm install --omit=dev --prefix "$APP_DIR/server"
install -m 644 "$APP_DIR/server/quote-assistant-api.service" \
  /etc/systemd/system/quote-assistant-api.service
chown root:ubuntu "$APP_DIR/.env"
chmod 640 "$APP_DIR/.env"
systemctl daemon-reload
systemctl enable --now quote-assistant-api
systemctl restart quote-assistant-api

curl --fail --retry 10 --retry-delay 2 http://127.0.0.1:3001/healthz
echo
