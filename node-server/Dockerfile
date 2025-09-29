
FROM node:22.20.0

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
