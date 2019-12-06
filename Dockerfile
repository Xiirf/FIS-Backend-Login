FROM node:9-alpine
WORKDIR /app
COPY . ./
RUN npm install -g node-gyp
RUN npm install --g --production windows-build-tools
RUN npm install
ENV NODE_ENV=production
EXPOSE 3000
CMD npm start
