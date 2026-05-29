FROM node:20-slim

WORKDIR /app

# Copy package files and install
COPY package*.json ./
RUN npm install --frozen-lockfile

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
