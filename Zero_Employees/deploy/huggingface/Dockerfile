# Hugging Face Space image. The heavy build happens in GitHub Actions
# (.github/workflows/hf-image.yml); the Space only pulls the result.
FROM ghcr.io/nitheeshcitbecse-eng/paperclip:hf

ENV PAPERCLIP_DEPLOYMENT_MODE=authenticated \
    PAPERCLIP_DEPLOYMENT_EXPOSURE=public \
    PAPERCLIP_MIGRATION_AUTO_APPLY=true \
    HEARTBEAT_SCHEDULER_ENABLED=true \
    PAPERCLIP_TELEMETRY_DISABLED=1

COPY hf-entrypoint.sh /usr/local/bin/hf-entrypoint.sh
RUN chmod 755 /usr/local/bin/hf-entrypoint.sh

EXPOSE 3100

# Setting ENTRYPOINT clears the base image's CMD, so both are restated.
ENTRYPOINT ["/usr/bin/tini", "--", "hf-entrypoint.sh"]
CMD ["node", "--import", "./server/node_modules/tsx/dist/loader.mjs", "server/dist/index.js"]
