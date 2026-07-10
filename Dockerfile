FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

ARG PUBLIC_API_URL=http://localhost:1323/api/v1
ARG PUBLIC_WS_URL=ws://localhost:1323/ws/terminal
ENV PUBLIC_API_URL=$PUBLIC_API_URL
ENV PUBLIC_WS_URL=$PUBLIC_WS_URL

RUN npm run build

FROM ghcr.io/static-web-server/static-web-server:2-alpine
COPY --from=builder /app/build /var/public

ENV SERVER_ROOT=/var/public \
	SERVER_COMPRESSION=true \
	SERVER_COMPRESSION_STATIC=true \
	SERVER_HEALTH=true \
	SERVER_LOG_LEVEL=warn

EXPOSE 80
