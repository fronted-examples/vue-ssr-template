# node版本最好和开发环境的版本保持一致。我的开发环境的版本是12.16.0
FROM node:12.22.7
WORKDIR /usr/local/docker/docker-vue-ssr/vue-ssr
COPY . /usr/local/docker/docker-vue-ssr
RUN cd /usr/local/docker/docker-vue-ssr/vue-ssr
RUN npm install
EXPOSE 3000
ENV NODE_ENV production

CMD [ "node", "server.js" ]
