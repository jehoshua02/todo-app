FROM node:22-alpine

# Install Docker CLI and git so deploy.sh can run git pull + docker compose
RUN apk add --no-cache docker-cli git

WORKDIR /app
COPY server.mjs .
EXPOSE 9000
CMD ["node", "server.mjs"]
