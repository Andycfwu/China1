#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker Desktop is not installed or is not running."
  echo "Install/start Docker Desktop, then run this file again."
  read -r -p "Press Return to close."
  exit 1
fi

if [ ! -f .env.local ]; then
  echo "Missing .env.local. Add the restaurant configuration before starting China 1."
  read -r -p "Press Return to close."
  exit 1
fi

echo "Starting China 1..."
docker compose up -d
echo
echo "China 1 is running at http://localhost:3000"
echo "Printer status is available at http://localhost:3101/health"
read -r -p "Press Return to close."
