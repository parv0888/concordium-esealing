FROM node
COPY . /src
WORKDIR /src
ENV NODE_ENV=production
RUN yarn install && yarn add compression-webpack-plugin && yarn global add serve
RUN yarn run build
ENTRYPOINT [ "serve", "-s", "build" ]