FROM --platform=linux/amd64 docker.io/bitnami/magento:2

# Copy Magento init script
RUN mkdir -p /docker-entrypoint-init.d
COPY magento-init.sh /docker-entrypoint-init.d/magento-init.sh
RUN chmod +x /docker-entrypoint-init.d/magento-init.sh

# Fix Mutex posixsem for Mac M1
RUN echo 'Mutex posixsem' >> /opt/bitnami/apache/conf/httpd.conf

# Use PORT env variable for Heroku
RUN sed -i "s/8080/\${PORT}/g" /opt/bitnami/apache/conf/httpd.conf
RUN sed -i "s/APACHE_HTTP_PORT_NUMBER/PORT/g" /opt/bitnami/scripts/apache/setup.sh /opt/bitnami/scripts/apache-env.sh /opt/bitnami/scripts/libapache.sh