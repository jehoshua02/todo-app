FROM mcr.microsoft.com/playwright:v1.59.1-noble

WORKDIR /app

COPY services/e2e/package.json services/e2e/package-lock.json ./
RUN npm ci

COPY services/e2e/ ./
