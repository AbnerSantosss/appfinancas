# Estágio 1: Compilação da aplicação React
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Passa a URL base da API no momento do build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Estágio 2: Servidor Nginx de produção
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Copia as regras do React Router (SPA) para o Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3025
CMD ["nginx", "-g", "daemon off;"]
