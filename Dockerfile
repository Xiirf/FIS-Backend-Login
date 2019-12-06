FROM node:latest
WORKDIR /app
COPY . ./
RUN yarn
ENV NODE_ENV=production
EXPOSE 3000
CMD npm start
