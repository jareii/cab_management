FROM php:8.2-apache

# Install MySQLi extension required for your code
RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli

# FIX: Disable conflicting MPM and enable the correct one
RUN a2dismod mpm_event || true && a2enmod mpm_prefork

# Copy your project files to the Apache document root
COPY . /var/www/html/

# Set permissions for Apache
RUN chown -R www-data:www-data /var/www/html

# Use the PORT environment variable provided by Railway
EXPOSE 80
