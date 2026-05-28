#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker Desktop is not installed or is not running."
  read -r -p "Press Return to close."
  exit 1
fi

echo "Stopping China 1..."
docker compose down
echo "China 1 has been stopped."
read -r -p "Press Return to close."
