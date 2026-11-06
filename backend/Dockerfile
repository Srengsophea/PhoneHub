FROM php:8.2-cli-alpine

# Install system dependencies & SQLite
RUN apk add --no-cache \
    sqlite \
    sqlite-dev \
    sqlite-libs \
    oniguruma-dev \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_sqlite mbstring bcmath gd zip

WORKDIR /var/www/html

# Copy backend source
COPY . .

# Copy composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install production dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Prepare storage & sqlite
RUN mkdir -p database storage/logs bootstrap/cache \
    && touch database/database.sqlite \
    && chmod -R 777 storage bootstrap/cache database

# Run migration & seed
RUN php artisan key:generate --force \
    && php artisan migrate:fresh --seed --force

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]

