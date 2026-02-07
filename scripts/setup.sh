#!/usr/bin/env bash
set -euo pipefail

if [ ! -f .env ]; then
  cp .env.example .env
fi

npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed

python3 -m venv .venv
source .venv/bin/activate
pip install -r python_service/requirements.txt

echo "Setup complete."
echo "Run frontend: npm run dev"
echo "Run AI service: source .venv/bin/activate && uvicorn python_service.main:app --reload --port 8001"
