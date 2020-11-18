# build the app
FROM node:14 AS build

WORKDIR /usr/src/front

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run prod

# host the app
FROM nginx:1.19

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=build /usr/src/front/dist/front /usr/share/nginx/html
