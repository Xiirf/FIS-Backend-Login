FROM node:latest
WORKDIR /app
COPY . ./
RUN yarn
ENV NODE_ENV=production
EXPOSE 6201
CMD npm start
