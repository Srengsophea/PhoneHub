#!/usr/bin/env bash
set -e

# ==============================================================================
# PhoneHub Backend Automated Setup for AWS EC2 (Ubuntu 22.04 / 24.04 LTS)
# Target Server: 54.151.151.35
# ==============================================================================

echo "========================================================"
echo "🚀 Starting PhoneHub Backend Setup on AWS EC2..."
echo "========================================================"

# 1. Update OS Packages
sudo apt update -y
sudo apt install -y software-properties-common curl git unzip nginx sqlite3

# 2. Add PHP PPA repository
sudo add-apt-repository -y ppa:ondrej/php
sudo apt update -y

# 3. Install PHP 8.2 and required extensions
sudo apt install -y php8.2 php8.2-fpm php8.2-cli php8.2-common php8.2-mysql \
  php8.2-sqlite3 php8.2-zip php8.2-gd php8.2-mbstring php8.2-curl php8.2-xml php8.2-bcmath

# 4. Install Composer globally
if ! command -v composer &> /dev/null; then
    echo "📦 Installing Composer..."
    curl -sS https://getcomposer.org/installer | php
    sudo mv composer.phar /usr/local/bin/composer
    sudo chmod +x /usr/local/bin/composer
fi

# 5. Setup Project Directory (/var/www/phonehub)
REPO_DIR="/var/www/phonehub"

if [ ! -d "$REPO_DIR" ]; then
    echo "📥 Cloning PhoneHub repository into $REPO_DIR..."
    sudo git clone https://github.com/Srengsophea/PhoneHub.git "$REPO_DIR"
else
    echo "🔄 Pulling latest updates into $REPO_DIR..."
    cd "$REPO_DIR"
    sudo git pull origin main
fi

# 6. Setup Backend (.env, Composer, Database)
cd "$REPO_DIR/backend"

# Ensure .env exists
if [ ! -f .env ]; then
    echo "⚙️ Creating .env configuration..."
    sudo cp .env.example .env
fi

# Configure .env with AWS Server IP & SQLite Database
sudo sed -i "s|APP_URL=.*|APP_URL=http://54.151.151.35|g" .env
sudo sed -i "s|DB_CONNECTION=.*|DB_CONNECTION=sqlite|g" .env
sudo sed -i "s|# DB_DATABASE=.*|DB_DATABASE=$REPO_DIR/backend/database/database.sqlite|g" .env
sudo sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=*|g" .env

# Create SQLite database file if missing
sudo touch database/database.sqlite

# Install dependencies
echo "📦 Running composer install..."
sudo composer install --no-dev --optimize-autoloader --no-interaction

# Generate App Key
echo "🔑 Generating application key..."
sudo php artisan key:generate --force

# Run database migrations and seeders
echo "🗄️ Running migrations and database seeders..."
sudo php artisan migrate --force --seed

# Create storage symlink
sudo php artisan storage:link --force

# 7. Configure Permissions for Web Server (www-data)
echo "🔒 Setting permissions for Nginx and PHP-FPM..."
sudo chown -R www-data:www-data "$REPO_DIR/backend/storage" "$REPO_DIR/backend/bootstrap/cache" "$REPO_DIR/backend/database"
sudo chmod -R 775 "$REPO_DIR/backend/storage" "$REPO_DIR/backend/bootstrap/cache" "$REPO_DIR/backend/database"

# 8. Configure Nginx Virtual Host
echo "🌐 Configuring Nginx..."
NGINX_CONF="/etc/nginx/sites-available/phonehub"

sudo bash -c "cat > $NGINX_CONF" << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name 54.151.151.35 _;
    root /var/www/phonehub/backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Origin, Content-Type, Accept, Authorization, X-Requested-With, X-Guest-Session-Id" always;

    index index.php index.html;

    charset utf-8;

    client_max_body_size 64M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
EOF

# Enable Nginx Site
sudo ln -sf /etc/nginx/sites-available/phonehub /etc/nginx/sites-enabled/phonehub
sudo rm -f /etc/nginx/sites-enabled/default

# Test and Restart Services
sudo nginx -t
sudo systemctl restart php8.2-fpm
sudo systemctl restart nginx
sudo systemctl enable nginx php8.2-fpm

echo "========================================================"
echo "✅ PhoneHub Backend is now LIVE on AWS EC2!"
echo "📍 API Base URL: http://54.151.151.35/api/v1"
echo "🔍 Health Check: http://54.151.151.35/api/v1/products"
echo "========================================================"
