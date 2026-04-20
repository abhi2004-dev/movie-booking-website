# Stage 1: Build the React application
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine
# Copy the built assets from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html
# Provide a custom nginx config to support React Router and proxy /api to backend
RUN echo 'server { \
    listen 80; \
    location / { root /usr/share/nginx/html; index index.html index.htm; try_files $uri $uri/ /index.html; } \
    location /api/ { proxy_pass http://backend:5000/api/; } \
    location /socket.io/ { proxy_pass http://backend:5000/socket.io/; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
