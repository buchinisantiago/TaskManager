# Stage 1: Build React Client
FROM node:18-alpine AS build
WORKDIR /app
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: PHP Application with Apache
FROM php:8.2-apache

# Install PostgreSQL drivers
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libcurl4-openssl-dev \
    && docker-php-ext-install pdo pdo_pgsql curl \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache rewrite module
RUN a2enmod rewrite

# Allow .htaccess overrides
RUN sed -ri -e 's!AllowOverride None!AllowOverride All!g' /etc/apache2/apache2.conf

# Set working directory
WORKDIR /var/www/html

# Copy server PHP files (config, api, etc.) OUTSIDE the document root for security
COPY server/config/ ./server/config/
COPY server/public/ ./server/public/

# Copy built React frontend INTO the Apache document root (default /var/www/html)
# This makes index.html the default page
COPY --from=build /app/dist/ ./

# Create .htaccess that routes /api/* to PHP and everything else to React SPA
RUN echo 'DirectoryIndex index.html\n\
    <IfModule mod_rewrite.c>\n\
    RewriteEngine On\n\
    # Route /api/daily-summary.php directly\n\
    RewriteRule ^api/daily-summary.php$ /server/public/api/daily-summary.php [QSA,L]\n\
    # Route other /api/* to index.php\n\
    RewriteRule ^api/(.*)$ /server/public/index.php [QSA,L]\n\
    RewriteCond %{REQUEST_FILENAME} !-f\n\
    RewriteCond %{REQUEST_FILENAME} !-d\n\
    RewriteRule ^ /index.html [L]\n\
    </IfModule>' > /var/www/html/.htaccess

# Debug: verify files exist
RUN echo "=== Document Root ===" && ls -la /var/www/html/ && echo "=== Server ===" && ls -la /var/www/html/server/public/

# Set permissions
RUN chown -R www-data:www-data /var/www/html

# Render uses PORT env variable (default 10000)
ENV PORT=10000
RUN sed -i 's/Listen 80/Listen ${PORT}/g' /etc/apache2/ports.conf
RUN sed -i 's/:80/:${PORT}/g' /etc/apache2/sites-available/000-default.conf
EXPOSE 10000

CMD ["sh", "-c", "apache2-foreground"]
