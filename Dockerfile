FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY app.js ./
ENV PORT=3000
EXPOSE 3000
# Run as the non-root "node" user for safety
USER node
HEALTHCHECK CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "app.js"]
