FROM node:18-alpine as builder
LABEL org.opencontainers.image.source="https://github.com/ARGA-Genomes/arga-admin-frontend"
LABEL org.opencontainers.image.description="A container image running the admin frontend server"
LABEL org.opencontainers.image.licenses="AGPL-3.0"

WORKDIR /usr/src/arga-admin-frontend
COPY . .
RUN npm install -g pnpm && pnpm install && pnpm build && pnpm --filter arga-admin-frontend --prod deploy pruned


FROM node:18-alpine
WORKDIR /usr/src/arga-admin-frontend

EXPOSE 3000
CMD ["pnpm", "start"]
RUN npm install -g pnpm

COPY --from=builder /usr/src/arga-admin-frontend/.next ./.next
COPY --from=builder /usr/src/arga-admin-frontend/pruned/node_modules ./node_modules
COPY --from=builder /usr/src/arga-admin-frontend/pruned/public ./public
COPY --from=builder /usr/src/arga-admin-frontend/pruned/package.json ./
COPY --from=builder /usr/src/arga-admin-frontend/pruned/next.config.js ./
