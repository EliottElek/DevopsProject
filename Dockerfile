FROM node:12
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm cache clean --force
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "npm", "start" ]
