#!/bin/bash

# Switch to ssh user 1001
#echo "Switching to ssh user 1001"
#su 1001

# Generate auth.json with magento credentials
echo "==> Generating auth.json magento credentials"
cd /bitnami/magento
composer config http-basic.repo.magento.com $MAGENTO_PUBLIC_KEY $MAGENTO_PRIVATE_KEY

# Installing Magento 2 sample data
echo "==> Installing Magento 2 sample data"
cd /bitnami/magento
php bin/magento sampledata:deploy
php bin/magento setup:upgrade

# Insert new magento configurations to display demo notice banner (design/head/demonotice) using sql
echo "==> Insert new magento configurations to display demo notice banner"
mysql -h $MAGENTO_DATABASE_HOST -u $MAGENTO_DATABASE_USER -p$MAGENTO_DATABASE_PASSWORD -e "use $MAGENTO_DATABASE_NAME; INSERT INTO core_config_data (scope, scope_id, path, value) VALUES ('default', 0, 'design/head/demonotice', '1');"

# Update magento head script configuration to fix styles.css path (design/head/includes) using sql
echo "==> Update magento head script configuration to fix styles.css path"
mysql -h $MAGENTO_DATABASE_HOST -u $MAGENTO_DATABASE_USER -p$MAGENTO_DATABASE_PASSWORD -e "use $MAGENTO_DATABASE_NAME; UPDATE core_config_data SET value = '<link rel=\"stylesheet\" type=\"text/css\" media=\"all\" href=\"pub/media/styles.css\" />' WHERE path = 'design/head/includes';"

# Insert new magento configuration to change default display currency to EUR
echo "==> Insert new magento configuration to change default display currency to EUR"
mysql -h $MAGENTO_DATABASE_HOST -u $MAGENTO_DATABASE_USER -p$MAGENTO_DATABASE_PASSWORD -e "use $MAGENTO_DATABASE_NAME; INSERT INTO core_config_data (scope, scope_id, path, value) VALUES ('default', 0, 'currency/options/default', 'EUR');"

# Enable Kohortpay_Payment module
# echo "==> Enable Kohortpay_Payment module"
#composer require customgento/module-admin-payment-m2
#bin/magento module:enable Kohortpay_Payment
#bin/magento setup:upgrade
#bin/magento cache:flush
#bin/magento setup:di:compile

# Refresh cache
echo "==> Refreshing cache"
bin/magento cache:flush

# Update magento directories and files permissions
echo "==> Update magento directories and files permissions"
chmod -R 777 var/ pub/ generated/
chown -R 1001:1001 var/ pub/ generated/
chmod 777 app/etc/config.php auth.json
chown -R 1001:1001 app/etc/config.php auth.json

