# Use multi-stage build for frontend
FROM node:18 AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Final image
FROM node:18-slim
WORKDIR /app
COPY --from=frontend-build /app/dist ./frontend
COPY server/ ./server/
COPY package*.json ./
COPY start.sh ./

# Install dependencies
RUN npm install

# Make startup script executable
RUN chmod +x start.sh

EXPOSE 3001

# Default command: run the startup script
CMD ["./start.sh"]
