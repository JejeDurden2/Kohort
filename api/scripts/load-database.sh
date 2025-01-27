#!/bin/bash
. .env

# Restore the dump into local db
echo "Restoring dump into local database..."
pg_restore --verbose --clean --no-acl --no-owner -d $DATABASE_URL latest.dump