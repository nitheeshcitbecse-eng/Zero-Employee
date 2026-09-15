---
title: Zero Employees
emoji: 📎
colorFrom: gray
colorTo: blue
sdk: docker
app_port: 3100
pinned: false
---

# Zero Employees on Hugging Face Spaces

This folder is the Space itself: upload `README.md`, `Dockerfile` and
`hf-entrypoint.sh` to a Docker Space. The image is built by GitHub Actions
(`.github/workflows/hf-image.yml`) and published to
`ghcr.io/nitheeshcitbecse-eng/paperclip:hf`.

Required Space secrets: `DATABASE_URL` (Neon Postgres), `BETTER_AUTH_SECRET`,
`PAPERCLIP_TOOL_ACTION_SIGNING_SECRET`, `PAPERCLIP_SECRETS_MASTER_KEY`, and at
least one of `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `GEMINI_API_KEY`.
