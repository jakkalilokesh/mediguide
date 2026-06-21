# Pin Node base image to a specific tag version
FROM node:20.11.0-bookworm-slim AS backend

WORKDIR /app/backend
COPY backend/package*.json ./
RUN apt-get update && apt-get install -y python3 make g++ && \
    npm ci --omit=dev && \
    apt-get purge -y python3 make g++ && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*
COPY backend/ ./

FROM node:20.11.0-bookworm-slim AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:20.11.0-bookworm-slim

# Install runtime libraries and wget for the healthcheck
RUN apt-get update && apt-get install -y libstdc++6 wget && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=backend --chown=node:node /app/backend ./backend
COPY --from=frontend-build --chown=node:node /app/frontend/dist ./frontend/dist

# Ensure memory and output directories exist and are writable by the node user
RUN mkdir -p /app/backend/memory && \
    chown -R node:node /app/backend

WORKDIR /app/backend
USER node

ENV NODE_ENV=production

EXPOSE 5000

# OCI Labels
ARG GIT_SHA="unknown"
ARG BUILD_DATE="unknown"
ARG REPO_URL="https://github.com/mediguide/mediguide"

LABEL org.opencontainers.image.revision=${GIT_SHA} \
      org.opencontainers.image.created=${BUILD_DATE} \
      org.opencontainers.image.source=${REPO_URL} \
      org.opencontainers.image.title="MediGuide" \
      org.opencontainers.image.description="Symptom Triage & Health Guidance Assistant"

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]
