# Stage 1: Build Angular app
FROM node:20 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build redBus_App

# Stage 2: Serve with NGINX
FROM nginx:alpine

# Remove default NGINX HTML
RUN rm -rf /usr/share/nginx/html/*

# Copy Angular build
COPY --from=build /app/dist/red-bus-app/browser /usr/share/nginx/html

# Copy NGINX config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy certificates into container
COPY nginx/certs /etc/nginx/certs

# Copy runtime entrypoint script
COPY docker-entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 443

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
