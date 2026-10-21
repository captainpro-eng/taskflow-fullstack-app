# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Production Server
FROM node:20-alpine AS production
LABEL maintainer="TaskFlow Team"
LABEL version="1.0.0"

WORKDIR /app

# Install curl for Docker healthcheck
RUN apk add --no-cache curl

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy backend source
COPY backend/ ./backend/

# Copy built frontend assets from builder stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Create directory for persistent SQLite database
RUN mkdir -p /app/backend/data && chown -R node:node /app

# Set environment
ENV NODE_ENV=production
ENV PORT=5001
ENV DB_PATH=/app/backend/data/taskflow.db

USER node
EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5001/api/health || exit 1

CMD ["node", "backend/server.js"]
