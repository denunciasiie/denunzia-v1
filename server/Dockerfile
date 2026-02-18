FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including sharp and other production deps)
RUN npm install --omit=dev

# Copy source code
COPY . .

# Expose port (Unified to 3001)
EXPOSE 3001

# Start command
CMD ["npm", "start"]
