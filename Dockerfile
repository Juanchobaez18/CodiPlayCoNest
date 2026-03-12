# ---------- Base ----------
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---------- Build ----------
FROM base AS build
COPY . .
RUN npm run build

# ---------- Production Image ----------
FROM node:20-alpine AS production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm install ts-node tsconfig-paths

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["sh", "-c", "npm run migration:run && node dist/main.js"]
# command: sh -c "npm run migration:run:stg && node dist/main.js"
# CMD ["node", "dist/main.js"]
