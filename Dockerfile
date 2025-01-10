# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose port
EXPOSE 3020

# Run the application
CMD ["npm", "start"]

# docker build -t eth_fetcher_api .
# docker run -p 3020:3020 eth_fetcher_api