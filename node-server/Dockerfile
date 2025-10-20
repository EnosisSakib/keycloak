FROM node:22.10.0-alpine

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install 

COPY . .

CMD ["npx", "ts-node-dev", "--respawn", "src/index.ts"]
