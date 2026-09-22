FROM node:20-alpine

WORKDIR /app

# Copy root workspace package and shared package
COPY package*.json ./
COPY shared/ ./shared/
COPY services/gateway/ ./services/gateway/

RUN npm install --omit=dev

EXPOSE 8080

CMD ["node", "services/gateway/src/server.js"]
