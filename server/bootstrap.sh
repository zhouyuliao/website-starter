#!/usr/bin/env bash
set -eu

APP_DIR=/opt/quote-assistant
REPO_URL=https://github.com/zhouyuliao/website-starter.git
if [ "$(id -u)" -eq 0 ]; then
  SUDO=
else
  SUDO=sudo
fi

$SUDO apt-get update
$SUDO apt-get install -y docker.io git openssl curl

if ! docker compose version >/dev/null 2>&1 && ! command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_PACKAGE=
  for candidate in docker-compose-v2 docker-compose-plugin docker-compose; do
    if apt-cache show "$candidate" >/dev/null 2>&1; then
      COMPOSE_PACKAGE=$candidate
      break
    fi
  done
  if [ -z "$COMPOSE_PACKAGE" ]; then
    echo "No Docker Compose package is available from the configured apt sources." >&2
    exit 1
  fi
  $SUDO apt-get install -y "$COMPOSE_PACKAGE"
fi

$SUDO systemctl enable --now docker

if [ ! -d "$APP_DIR/.git" ]; then
  $SUDO mkdir -p "$(dirname "$APP_DIR")"
  $SUDO git clone "$REPO_URL" "$APP_DIR"
else
  $SUDO git -C "$APP_DIR" fetch origin main
  $SUDO git -C "$APP_DIR" reset --hard origin/main
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

if docker compose version >/dev/null 2>&1; then
  $SUDO docker compose up -d --build
else
  $SUDO docker-compose up -d --build
fi
curl --fail --retry 10 --retry-delay 2 http://127.0.0.1:3001/healthz
echo
