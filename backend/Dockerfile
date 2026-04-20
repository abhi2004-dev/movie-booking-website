FROM node:18-alpine

WORKDIR /app

# Install dependencies first for caching
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Expose the API port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
