FROM node:22-slim
WORKDIR /app
COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarn --frozen-lockfile
CMD yarn start