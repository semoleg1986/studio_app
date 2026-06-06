FROM node:22-alpine3.22 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine3.22 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM alpine:3.22 AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache libstdc++ \
  && addgroup -S node \
  && adduser -S node -G node

COPY --from=builder /usr/local/bin/node /usr/local/bin/node
COPY --from=builder --chown=node:node /app/.output /app/.output
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
