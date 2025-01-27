#!/bin/bash
. .env

# Remove old dump
echo "Removing old dump..."
rm -f latest.dump

# Download the dump from Heroku
echo "Downloading dump from Heroku..."
heroku pg:backups:capture --app $STAGING_APP_NAME
heroku pg:backups:download --app $STAGING_APP_NAME

# Restore the dump into local db
echo "Restoring dump into local database..."
pg_restore --verbose --clean --no-acl --no-owner -d $DATABASE_URL latest.dump

echo "Database restoration complete!"
