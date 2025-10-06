# syntax=docker/dockerfile:1
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
RUN npm prune --omit=dev && npm cache clean --force
RUN mkdir -p uploads

EXPOSE 5000
CMD ["node", "src/server.js"]
