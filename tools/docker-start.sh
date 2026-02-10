#!/bin/sh
set -e

ROOT="/var/www/public"

php "$ROOT/tools/wait-for-db.php" --timeout=60 --interval=2
php "$ROOT/tools/migrate.php"

if [ "$#" -gt 0 ]; then
  exec "$@"
fi

exec php-fpm
