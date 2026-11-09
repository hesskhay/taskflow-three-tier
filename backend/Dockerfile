# Stage 1: Install dependencies and test

FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm test

# Stage 2: Production Runtime

FROM node:24-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/src ./src

USER node

EXPOSE 3000

CMD ["node", "src/server.js"]
