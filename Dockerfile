FROM node:8
RUN npm install webpack -g && npm install simplehttpserver -g
WORKDIR /tmp
COPY package.json /tmp/
RUN npm install
WORKDIR /usr/src/app
COPY . /usr/src/app/
RUN cp -a /tmp/node_modules /usr/src/app/
RUN webpack
CMD [ "simplehttpserver" ]
EXPOSE 8000
