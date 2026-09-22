FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY shared/ ./shared/
COPY services/account-service/ ./services/account-service/

RUN npm install --omit=dev

EXPOSE 5002

CMD ["node", "services/account-service/src/server.js"]
