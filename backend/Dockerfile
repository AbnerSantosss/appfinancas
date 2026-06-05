# Estágio 1: Build da aplicação TypeScript
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Estágio 2: Execução em produção
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Garante que a pasta de mídia local existe
RUN mkdir -p /app/uploads

EXPOSE 3001
CMD ["npm", "start"]
