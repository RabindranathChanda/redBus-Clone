#!/bin/bash
set -e

echo "====================================="
echo "     redBus API Environment Setup     "
echo "====================================="
echo

# -----------------------------
# 1️⃣ Prompt user for environment values
# -----------------------------
echo "=== Database Setup ==="
read -p "Enter database server name (default: redbus-db): " DB_SERVER
DB_SERVER=${DB_SERVER:-redbus-db}

read -p "Enter database name (default: redBus): " DB_NAME
DB_NAME=${DB_NAME:-redBus}

read -p "Enter database user (default: sa): " DB_USER
DB_USER=${DB_USER:-sa}

read -sp "Enter database password: " DB_PASSWORD
echo
echo

echo "=== JWT Setup ==="
read -p "Enter JWT secret key: " JWT_KEY
read -p "Enter JWT issuer (default: redBus_Api): " JWT_ISSUER
JWT_ISSUER=${JWT_ISSUER:-redBus_Api}

read -p "Enter JWT audience (default: redBus_Client): " JWT_AUDIENCE
JWT_AUDIENCE=${JWT_AUDIENCE:-redBus_Client}
echo

echo "=== Mailer Service ==="
read -p "Enter your email: " EMAIL_USERNAME
read -sp "Enter email app-password: " EMAIL_PASSWORD
echo
echo

echo "=== Google reCAPTCHA v3 Setup ==="
read -p "Enter reCAPTCHA site key: " RECAPTCHA_SITE_KEY
read -p "Enter reCAPTCHA secret key: " RECAPTCHA_SECRET_KEY
echo

# -----------------------------
# 2️⃣ Prompt user for HTTPS cert password
# -----------------------------
CERT_DIR="./redBus-api/certs"
CERT_FILE="$CERT_DIR/redbus.pfx"
KEY_FILE="$CERT_DIR/redbus.key"
CRT_FILE="$CERT_DIR/redbus.crt"

echo "=== HTTPS Setup ==="
read -sp "Enter a password for the HTTPS certificate: " CERT_PASSWORD
echo
read -p "Enter Common Name (e.g., your domain or 'localhost') [localhost]: " CN
CN=${CN:-localhost}
echo

# -----------------------------
# 3️⃣ Create certificate if missing
# -----------------------------
mkdir -p "$CERT_DIR"

if [ ! -f "$CERT_FILE" ]; then
  echo "Generating self-signed certificate for CN=$CN ..."
  openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
    -keyout "$KEY_FILE" \
    -out "$CRT_FILE" \
    -subj "/CN=$CN"

  # Combine key and cert into a PFX
  openssl pkcs12 -export \
    -out "$CERT_FILE" \
    -inkey "$KEY_FILE" \
    -in "$CRT_FILE" \
    -passout pass:"$CERT_PASSWORD"
  echo "Certificate generated successfully."
fi
echo

# -----------------------------
# 4️⃣ Write .env file dynamically
# -----------------------------
cat > ./redBus-api/.env <<EOF
DB_SERVER=$DB_SERVER
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
JWT_KEY=$JWT_KEY
JWT_ISSUER=$JWT_ISSUER
JWT_AUDIENCE=$JWT_AUDIENCE
EMAIL_USERNAME=$EMAIL_USERNAME
EMAIL_PASSWORD=$EMAIL_PASSWORD
RECAPTCHA_SITE_KEY=$RECAPTCHA_SITE_KEY
RECAPTCHA_SECRET_KEY=$RECAPTCHA_SECRET_KEY
EOF

echo ".env file created successfully! ✅"
echo

# -----------------------------
# 5️⃣ Build and run containers
# -----------------------------
export CERT_PASSWORD="$CERT_PASSWORD"
echo "🚀 Building and starting Docker containers..."
docker-compose down -v
docker-compose up --build -d

echo
echo "✅ Setup complete! API is now running with HTTPS enabled."
