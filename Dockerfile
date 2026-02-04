# Use Node.js LTS version
FROM node:20-alpine

# Install build dependencies for better-sqlite3
RUN apk update && apk add --no-cache python3 make gcc g++ musl-dev

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application files
COPY . .

# Create directory for SQLite database
RUN mkdir -p /app/data

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "index.js"]
