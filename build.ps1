$ErrorActionPreference = "Stop"

# -----------------------------
# 1️⃣ Prompt user for environment values
# -----------------------------
Write-Host "=== =================================== ==="
Write-Host "===     redBus API Environment Setup    ==="
Write-Host "=== =================================== ===`n"


Write-Host "=== Database Setup ==="
$DB_SERVER = Read-Host "Enter database server name (default: redbus-db)"
if ([string]::IsNullOrWhiteSpace($DB_SERVER)) { $DB_SERVER = "redbus-db" }

$DB_NAME = Read-Host "Enter database name (default: redBus)"
if ([string]::IsNullOrWhiteSpace($DB_NAME)) { $DB_NAME = "redBus" }

$DB_USER = Read-Host "Enter database user (default: sa)"
if ([string]::IsNullOrWhiteSpace($DB_USER)) { $DB_USER = "sa" }

$DB_PASSWORD = Read-Host -AsSecureString "Enter database password"

Write-Host "`n=== JWT Setup ==="
$JWT_KEY = Read-Host "Enter JWT secret key"
$JWT_ISSUER = Read-Host "Enter JWT issuer (default: redBus_Api)"
if ([string]::IsNullOrWhiteSpace($JWT_ISSUER)) { $JWT_ISSUER = "redBus_Api" }

$JWT_AUDIENCE = Read-Host "Enter JWT audience (default: redBus_Client)"
if ([string]::IsNullOrWhiteSpace($JWT_AUDIENCE)) { $JWT_AUDIENCE = "redBus_Client" }

Write-Host "`n=== Mailer Service ==="
$EMAIL_USERNAME = Read-Host "Enter your email"
$EMAIL_PASSWORD = Read-Host "Enter email app-password"

Write-Host "`n=== Google reCAPTCHA v3 Setup ==="
$RECAPTCHA_SITE_KEY = Read-Host "Enter reCAPTCHA site key"
$RECAPTCHA_SECRET_KEY = Read-Host "Enter reCAPTCHA secret key"

# -----------------------------
# 2️⃣ Prompt user for HTTPS cert password
# -----------------------------
$CERT_DIR = ".\redBus-api\certs"
$CERT_FILE = "$CERT_DIR\redbus.pfx"

Write-Host "`n=== HTTPs Setup ==="
$CERT_PASSWORD = Read-Host -AsSecureString "Enter a password for the HTTPS certificate"
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($CERT_PASSWORD)
$PlainCertPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# -----------------------------
# 3️⃣ Create certificate if missing
# -----------------------------
if (-not (Test-Path $CERT_DIR)) {
    New-Item -ItemType Directory -Path $CERT_DIR | Out-Null
}

if (-not (Test-Path $CERT_FILE)) {
    Write-Host "`nGenerating ASP.NET Core development certificate..."
    dotnet dev-certs https -ep $CERT_FILE -p $PlainCertPassword
    Write-Host "`nCertificate generated successfully."
}


# -----------------------------
# 🔒 Generate Nginx self-signed certificate (with OpenSSL)
# -----------------------------
$CertName = "redbus.local"
$CertDir = ".\redBus_App\nginx\certs"
$FRONTEND_CERT_PASSWORD = Read-Host -AsSecureString "Enter a password for the Frontend HTTPS certificate"

# Ensure directory exists
if (-not (Test-Path $CertDir)) {
    New-Item -ItemType Directory -Path $CertDir | Out-Null
}

# Paths
$certPath = Join-Path $CertDir "$CertName.crt"
$keyPath  = Join-Path $CertDir "$CertName.key"
$pfxPath  = Join-Path $CertDir "$CertName.pfx"

Write-Host "`nGenerating self-signed HTTPS certificate for localhost..."

# Create a temporary self-signed certificate
$cert = New-SelfSignedCertificate `
    -DnsName "localhost" `
    -CertStoreLocation "Cert:\CurrentUser\My" `
    -FriendlyName "redbus.local self-signed" `
    -KeyExportPolicy Exportable `
    -KeySpec Signature `
    -NotAfter (Get-Date).AddYears(2)

# Convert SecureString password to plain text for OpenSSL
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($FRONTEND_CERT_PASSWORD)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Export .pfx (for reference)
Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $FRONTEND_CERT_PASSWORD | Out-Null

# Use OpenSSL to extract .key and .crt
if (Get-Command openssl -ErrorAction SilentlyContinue) {
    Write-Host "OpenSSL found. Exporting .crt and .key..."
    # Extract private key
    openssl pkcs12 -in $pfxPath -nocerts -nodes -passin pass:$plainPassword -out $keyPath
    # Extract certificate
    openssl pkcs12 -in $pfxPath -clcerts -nokeys -passin pass:$plainPassword -out $certPath
    Write-Host "Self-signed certificate and private key generated successfully:`n$certPath`n$keyPath`n"
} else {
    Write-Warning "OpenSSL not found. Only .pfx and .crt exported. .key cannot be generated without OpenSSL."
    Export-Certificate -Cert $cert -FilePath $certPath | Out-Null
}


# -----------------------------
# 4️⃣ Write .env file dynamically
# -----------------------------
$envFile = @"
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
"@

$envFile | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "`n.env file created successfully!"

# -----------------------------
# 5️⃣ Build and run containers
# -----------------------------
$env:CERT_PASSWORD = $PlainCertPassword
Write-Host "Building and starting containers..."
docker-compose down -v
docker-compose up --build -d

Write-Host "`n Setup complete! API is now running with HTTPS enabled."
