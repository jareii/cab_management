FROM php:8.2-apache

RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli

RUN a2dismod mpm_event || true && a2enmod mpm_prefork

RUN sed -i 's/80/${PORT}/g' /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf

COPY . /var/www/html/

RUN chown -R www-data:www-data /var/www/html

EXPOSE ${PORT}
