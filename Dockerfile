# Description: Dockerfile for Node.js app
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

# Building code for production
RUN npm i --production
# Fix database
RUN npx prisma generate

# Bundle app source
COPY . .

# Expose port 3000
EXPOSE 3000

# Run the app
CMD [ "node", "server.js" ]