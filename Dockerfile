# Use a lighter version of Node as a parent image
FROM node:8.12-alpine
# Set the working directory to /api
WORKDIR /api
# copy package.json into the container at /api
COPY package.json /api/
# install dependencies
RUN apk --no-cache add --virtual builds-deps build-base python
RUN npm config set python /usr/bin/python
RUN npm i npm@latest -g
RUN apk update && apk add --virtual build-dependencies
RUN npm install

RUN npm rebuild bcrypt --build-from-source
RUN apk del builds-deps
# Copy the current directory contents into the container at /api
COPY ./jest.config.js /api/
COPY ./app.js /api/
COPY ./server.js /api/
COPY ./routes/*.js /api/
COPY ./models/*.js /api/
COPY ./db/*.js /api/
COPY ./controllers/*.js /api/
# Make port 80 available to the world outside this container
EXPOSE 6200
# Run the app when the container launches
CMD ["npm", "start"]