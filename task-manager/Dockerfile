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

# Configure Apache DocumentRoot to point to server/public
ENV APACHE_DOCUMENT_ROOT /var/www/html/server/public

RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Allow .htaccess overrides (needed for SPA routing and API rewrite)
RUN sed -ri -e 's!AllowOverride None!AllowOverride All!g' /etc/apache2/apache2.conf

# Prioritize index.html over index.php (serve React SPA, not PHP)
RUN echo 'DirectoryIndex index.html index.php' >> /etc/apache2/apache2.conf

# Render uses PORT env variable (default 10000), configure Apache to listen on it
RUN sed -i 's/Listen 80/Listen ${PORT}/g' /etc/apache2/ports.conf
RUN sed -i 's/:80/:${PORT}/g' /etc/apache2/sites-available/000-default.conf

# Set working directory
WORKDIR /var/www/html

# Copy server files
COPY server/ ./server/

# Copy built frontend assets from builder stage into server/public/
COPY --from=build /app/dist/ ./server/public/

# Debug: list what's in server/public to verify index.html exists
RUN ls -la /var/www/html/server/public/

# Set permissions
RUN chown -R www-data:www-data /var/www/html

# Render provides PORT env var, default to 10000
ENV PORT=10000
EXPOSE 10000

# Start Apache with env variable substitution
CMD ["sh", "-c", "apache2-foreground"]
