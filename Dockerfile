# Stage 1: Build the Vue 3 frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Install frontend dependencies
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copy configuration and source files
COPY .env* ./
COPY frontend/ ./frontend/

# Build static assets
RUN cd frontend && npm run build

# Stage 2: Express backend runtime
FROM node:20-alpine
WORKDIR /app

# Install backend production dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# Copy backend source and built frontend dist
COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY .env* ./

EXPOSE 8080
WORKDIR /app/backend

CMD ["node", "server.js"]
