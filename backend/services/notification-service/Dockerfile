FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY shared/ ./shared/
COPY services/notification-service/ ./services/notification-service/

RUN npm install --omit=dev

EXPOSE 5004

CMD ["node", "services/notification-service/src/server.js"]
