FROM node:22-slim
WORKDIR /app

COPY .next/standalone /app
COPY .next/static /app/.next/static
COPY public ./public

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
ENTRYPOINT [ "node", "server.js" ]
