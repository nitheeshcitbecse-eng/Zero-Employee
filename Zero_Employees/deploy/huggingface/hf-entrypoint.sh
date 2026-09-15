#!/bin/sh
set -e

# Hugging Face injects SPACE_HOST (e.g. user-space.hf.space) at runtime.
if [ -z "$PAPERCLIP_PUBLIC_URL" ] && [ -n "$SPACE_HOST" ]; then
    export PAPERCLIP_PUBLIC_URL="https://$SPACE_HOST"
fi

if [ -z "$DATABASE_URL" ]; then
    echo "hf-entrypoint.sh: DATABASE_URL secret is not set; data will be lost on every restart" >&2
fi

exec docker-entrypoint.sh "$@"
