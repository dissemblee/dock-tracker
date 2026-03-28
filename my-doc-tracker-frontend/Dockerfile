FROM node:20-alpine AS build-env
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build-env /app/build ./build
COPY --from=build-env /app/server.js ./server.js

ENV NODE_ENV=production
ENV PORT=5173
ENV HOST=0.0.0.0

CMD ["node", "server.js"]
