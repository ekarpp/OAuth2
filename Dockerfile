FROM node:14

WORKDIR /usr/src/OAuth2

COPY package*json ./

RUN npm install

COPY . .

EXPOSE 8080
