# Use Alpine-based Node image
FROM node:22.10.0-alpine

# Install bash & build tools (needed for native modules)
RUN apk add --no-cache bash git python3 make g++

WORKDIR /usr/src/app

# Copy package.json & package-lock.json
COPY package*.json ./

# Install all dependencies
RUN npm install 

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the server with ts-node-dev
CMD ["npx", "ts-node-dev", "--respawn", "src/index.ts"]
