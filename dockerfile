FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install knex

RUN npm install

ENV NODE_ENV=development

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "node -r ts-node/register ./node_modules/knex/bin/cli.js --knexfile knexfile.cjs migrate:latest && npm run start:dev"]