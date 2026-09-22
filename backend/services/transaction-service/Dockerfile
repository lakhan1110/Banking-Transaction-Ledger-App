FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY shared/ ./shared/
COPY services/transaction-service/ ./services/transaction-service/

RUN npm install --omit=dev

EXPOSE 5003

CMD ["node", "services/transaction-service/src/server.js"]
