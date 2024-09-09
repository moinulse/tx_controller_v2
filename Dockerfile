FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run migrate

EXPOSE 3100

CMD ["npm", "start"]