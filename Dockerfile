FROM node:22-alpine
WORKDIR /app

COPY .next/standalone /app
COPY .next/static /app/.next/static
COPY public ./public

ENV NODE_ENV=production
EXPOSE 3000
ENTRYPOINT [ "node", "server.js" ]
