#!/usr/bin/env bash
set -eu

APP_DIR=/opt/quote-assistant
REPO_URL=https://github.com/zhouyuliao/website-starter.git

if ! command -v docker >/dev/null 2>&1; then
  apt-get update
  apt-get install -y docker.io docker-compose-plugin git openssl curl
  systemctl enable --now docker
fi

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

docker compose up -d --build
curl --fail --retry 10 --retry-delay 2 http://127.0.0.1:3001/healthz
echo
