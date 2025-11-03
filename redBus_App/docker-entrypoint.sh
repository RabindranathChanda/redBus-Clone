#!/bin/sh
set -e

# Fail if required env vars missing
if [ -z "$API_URL" ]; then
  echo "ERROR: API_URL not set"
  exit 1
fi

if [ -z "$RECAPTCHA_SITE_KEY" ]; then
  echo "ERROR: RECAPTCHA_SITE_KEY not set"
  exit 1
fi

# Ensure assets folder exists
mkdir -p /usr/share/nginx/html/assets

# Create runtime-config.json
cat <<EOF > /usr/share/nginx/html/assets/runtime-config.json
{
  "apiUrl": "${API_URL}",
  "reCaptchaSiteKey": "${RECAPTCHA_SITE_KEY}"
}
EOF

# Start NGINX
exec "$@"
