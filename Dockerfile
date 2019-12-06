FROM node:9-alpine
WORKDIR /app
COPY . ./
RUN yarn
ENV NODE_ENV=production
EXPOSE 3000
CMD npm start
