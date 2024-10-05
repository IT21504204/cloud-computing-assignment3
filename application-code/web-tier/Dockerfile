# Use a Node.js image to build the frontend
FROM node:14 as build

WORKDIR /app

# Copy the frontend code
COPY ./ /app

# Install dependencies and build the project
RUN npm install
RUN npm run build

# Use Nginx to serve the built files
FROM nginx:alpine

# Copy the built files from the previous stage
COPY --from=build /app/build /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/nginx.conf

RUN rm /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
