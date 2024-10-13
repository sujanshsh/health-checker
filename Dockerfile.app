FROM node:20.16.0-alpine3.20

WORKDIR /home/node/app

ENV NODE_ENV=production

COPY . .

USER node

EXPOSE 3000

CMD ["node", "src/index.js"]
