# Stage 1: Build Frontend
FROM node:18-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Production Server Runtime
FROM node:18-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies for server
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production

# Copy server code
COPY server/ ./

EXPOSE 5000

CMD ["node", "src/server.js"]

