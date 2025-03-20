FROM nginx:alpine

# Set the working directory
WORKDIR /app

# Remove default Nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy all files into the Nginx serving directory
COPY . /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
