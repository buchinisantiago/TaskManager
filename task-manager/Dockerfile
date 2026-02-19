# Stage 1: Build Vue/React Client
FROM node:18-alpine AS build
WORKDIR /app
COPY client/package*.json ./
RUN npm install
COPY client/ ./
# Build the application
RUN npm run build

# Stage 2: PHP Application with Apache
FROM php:8.2-apache

# Install PostgreSQL drivers and other dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libcurl4-openssl-dev \
    && docker-php-ext-install pdo pdo_pgsql curl

# Enable Apache rewrite module
RUN a2enmod rewrite

# Configure Apache DocumentRoot to point to public
ENV APACHE_DOCUMENT_ROOT /var/www/html/public

RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Set working directory
WORKDIR /var/www/html

# Copy server files
COPY server/ ./server/

# Copy built frontend assets from builder stage to public directory
# The build output is usually in dist/ but we put it in server/public/ to serve it
COPY --from=build /app/dist ./server/public/

# Set permissions
RUN chown -R www-data:www-data /var/www/html

# Expose port 80
EXPOSE 80
