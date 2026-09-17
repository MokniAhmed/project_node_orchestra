FROM node:16-bullseye

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

EXPOSE 8000
EXPOSE 5000

CMD ["node", "server.js"]
