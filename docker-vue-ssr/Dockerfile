# node版本最好和开发环境的版本保持一致。我的开发环境的版本是12.16.0
FROM node:12.22.7
WORKDIR /usr/local/docker/docker-mall/mall
COPY . /usr/local/docker/docker-mall
RUN cd /usr/local/docker/docker-mall/mall
RUN npm install
EXPOSE 3000
CMD [ "node", "pro-server.js" ]
