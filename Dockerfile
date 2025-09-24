# syntax=docker/dockerfile:1.7

FROM node:20.16.0-alpine3.19 AS base
WORKDIR /usr/src/app
ENV NODE_ENV=development

# Install dependencies first (leverages Docker layer caching)
COPY package*.json ./
RUN npm install

# Copy source files
COPY tsconfig.json ./
COPY .eslintrc.js .prettierrc ./
COPY src ./src
COPY scripts ./scripts
COPY tests ./tests
COPY storage ./storage

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
