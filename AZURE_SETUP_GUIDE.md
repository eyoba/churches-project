# Azure Setup Guide - Complete .env Configuration

This guide will help you set up all the required environment variables for your church management system using Azure services.

## Overview of Required Services

Your `.env` file in the backend needs these services:

1. ✅ **PostgreSQL Database** - Store church data (Azure Database for PostgreSQL)
2. ✅ **SMS Service** - Send SMS messages (Azure Communication Services or Twilio)
3. ✅ **Image Storage** - Store photos (Azure Blob Storage or Cloudinary)
4. ✅ **JWT Secret** - Authentication security (Generate random string)

---

## Current .env File Location

`/home/eyob/personal/debreiyesus/churches-project/backend/.env`

---

## 1. PostgreSQL Database Setup

### Option A: Use Local PostgreSQL (Easiest for Development)

**Current Setup:**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/churches_system
```

**How to configure:**
1. Find your PostgreSQL username (usually `postgres` or your system username)
2. Set/remember your PostgreSQL password
3. Update the .env file:

```env
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/churches_system
```

**Example:**
```env
DATABASE_URL=postgresql://eyob:mypassword@localhost:5432/churches_system
```

### Option B: Use Azure Database for PostgreSQL

**Step 1: Create Azure PostgreSQL Database**
```bash
# Login to Azure
az login

# Create resource group (if you don't have one)
az group create --name churches-rg --location norwayeast

# Create PostgreSQL server
az postgres flexible-server create \
  --resource-group churches-rg \
  --name churches-db-server \
  --location norwayeast \
  --admin-user churchadmin \
  --admin-password "YourSecurePassword123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 15 \
  --storage-size 32
```

**Step 2: Create the database**
```bash
az postgres flexible-server db create \
  --resource-group churches-rg \
  --server-name churches-db-server \
  --database-name churches_system
```

**Step 3: Allow your IP address**
```bash
# Get your public IP
curl ifconfig.me

# Add firewall rule
az postgres flexible-server firewall-rule create \
  --resource-group churches-rg \
  --name churches-db-server \
  --rule-name allow-my-ip \
  --start-ip-address YOUR_IP_ADDRESS \
  --end-ip-address YOUR_IP_ADDRESS
```

**Step 4: Get connection string**
```bash
az postgres flexible-server show-connection-string \
  --server-name churches-db-server \
  --database-name churches_system \
  --admin-user churchadmin \
  --admin-password "YourSecurePassword123!"
```

**Update .env:**
```env
DATABASE_URL=postgresql://churchadmin:YourSecurePassword123!@churches-db-server.postgres.database.azure.com:5432/churches_system?sslmode=require
```

---

## 2. JWT Secret Setup

This is a random string used to sign authentication tokens.

**Generate a secure random string:**

```bash
# Method 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Method 2: Using OpenSSL
openssl rand -hex 32

# Method 3: Online generator
# Visit: https://www.random.org/strings/
```

**Update .env:**
```env
JWT_SECRET=your_generated_random_string_here_abc123def456
```

**Example:**
```env
JWT_SECRET=8f3b2c1d9e7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c
```

---

## 3. SMS Service Setup

### Option A: Azure Communication Services (Recommended for Azure users)

**Step 1: Create Communication Services resource**

Via Azure Portal:
1. Go to https://portal.azure.com
2. Click "Create a resource"
3. Search for "Communication Services"
4. Click Create
5. Fill in:
   - Resource group: `churches-rg`
   - Name: `churches-sms-service`
   - Region: Norway East
6. Click "Review + Create" → "Create"

**Step 2: Get connection string**
1. Go to your Communication Services resource
2. Click "Keys" in the left menu
3. Copy the "Primary connection string"

**Step 3: Get a phone number**
1. In your Communication Services resource, click "Phone numbers"
2. Click "Get" → "Get a phone number"
3. Select:
   - Country: Norway
   - Number type: Toll-free or Local
   - Capabilities: Check "Send SMS"
4. Complete purchase

**Update .env:**
```env
# For Azure Communication Services
AZURE_COMMUNICATION_CONNECTION_STRING=your_connection_string_here
AZURE_COMMUNICATION_PHONE_NUMBER=+47xxxxxxxx
```

**Note:** You'll need to modify the backend code to use Azure Communication Services instead of Twilio. See below.

### Option B: Twilio (Easier, works globally)

**Step 1: Sign up for Twilio**
1. Go to https://www.twilio.com/try-twilio
2. Sign up for free trial ($15 credit)
3. Verify your phone number

**Step 2: Get credentials**
1. Go to https://console.twilio.com
2. From your dashboard, copy:
   - Account SID
   - Auth Token
3. Go to "Phone Numbers" → "Buy a number"
4. Search for a number with SMS capability
5. Purchase (uses trial credit)

**Update .env:**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+47xxxxxxxx
```

---

## 4. Image Storage Setup

### Option A: Azure Blob Storage

**Step 1: Create Storage Account**

Via Azure CLI:
```bash
# Create storage account
az storage account create \
  --name churchesstorage2024 \
  --resource-group churches-rg \
  --location norwayeast \
  --sku Standard_LRS \
  --kind StorageV2

# Create container for images
az storage container create \
  --name church-photos \
  --account-name churchesstorage2024 \
  --public-access blob
```

**Step 2: Get connection string**
```bash
az storage account show-connection-string \
  --name churchesstorage2024 \
  --resource-group churches-rg
```

**Update .env:**
```env
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=churchesstorage2024;AccountKey=...
AZURE_STORAGE_CONTAINER_NAME=church-photos
```

**Note:** You'll need to modify backend to use Azure Blob Storage instead of Cloudinary.

### Option B: Cloudinary (Easier, free tier available)

**Step 1: Sign up**
1. Go to https://cloudinary.com/users/register/free
2. Sign up for free account (25GB storage, 25GB bandwidth/month)
3. Verify email

**Step 2: Get credentials**
1. Go to https://console.cloudinary.com
2. From your dashboard, you'll see:
   - Cloud name
   - API Key
   - API Secret

**Update .env:**
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=1234567890123456
CLOUDINARY_API_SECRET=your_api_secret_here
```

---

## Complete .env File Example

### For Local Development (Recommended to start with):

```env
PORT=5180

# Local PostgreSQL
DATABASE_URL=postgresql://eyob:mypassword@localhost:5432/churches_system

# JWT Secret (generate your own)
JWT_SECRET=8f3b2c1d9e7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c

# Twilio SMS (easy to set up)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+47xxxxxxxx

# Cloudinary Images (free tier)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=1234567890123456
CLOUDINARY_API_SECRET=your_api_secret_here

# CORS
WEBSITE_URL=http://localhost:5178
SMS_APP_URL=http://localhost:5179

# Environment
NODE_ENV=development
```

### For Azure Production:

```env
PORT=5180

# Azure PostgreSQL
DATABASE_URL=postgresql://churchadmin:YourSecurePassword123!@churches-db-server.postgres.database.azure.com:5432/churches_system?sslmode=require

# JWT Secret
JWT_SECRET=8f3b2c1d9e7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c

# Azure Communication Services
AZURE_COMMUNICATION_CONNECTION_STRING=endpoint=https://...
AZURE_COMMUNICATION_PHONE_NUMBER=+47xxxxxxxx

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AZURE_STORAGE_CONTAINER_NAME=church-photos

# CORS (update with your Azure Web App URLs)
WEBSITE_URL=https://your-church-website.azurewebsites.net
SMS_APP_URL=https://your-sms-app.azurewebsites.net

# Environment
NODE_ENV=production
```

---

## Quick Start - Minimal Setup to Test

If you want to test the system quickly without setting up external services:

1. **Set up only the database** (required):
   ```env
   DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/churches_system
   ```

2. **Generate JWT secret** (required):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Add to .env:
   ```env
   JWT_SECRET=your_generated_string
   ```

3. **Leave SMS and Images for later** (optional):
   - The app will work without SMS (just can't send messages)
   - You can use direct image URLs without Cloudinary

Your minimal .env:
```env
PORT=5180
DATABASE_URL=postgresql://eyob:mypassword@localhost:5432/churches_system
JWT_SECRET=generated_random_string_here
WEBSITE_URL=http://localhost:5178
SMS_APP_URL=http://localhost:5179
NODE_ENV=development
```

---

## Azure Cost Estimates (Monthly)

| Service | Free Tier | Paid (Small) | Recommended for Start |
|---------|-----------|--------------|----------------------|
| PostgreSQL Flexible Server | ❌ None | ~$13/month (B1ms) | Local PostgreSQL |
| Communication Services SMS | 🎁 Trial credit | $0.0075/SMS | Twilio (free trial) |
| Blob Storage | ✅ 5GB free | ~$1/month | Cloudinary (free 25GB) |
| **Total** | - | ~$14/month | **$0** (use free tiers) |

**Recommendation for Development:** Use local PostgreSQL + Twilio free trial + Cloudinary free tier = $0/month

**Recommendation for Production:** Use Azure PostgreSQL + Azure Communication Services + Azure Blob Storage = ~$14-20/month

---

## Next Steps

1. Choose your services (local or Azure)
2. Set up the required credentials
3. Update your `.env` file
4. Run the database migration
5. Start the backend server
6. Test everything!

---

## Need Help?

- **Azure Portal:** https://portal.azure.com
- **Azure CLI Docs:** https://docs.microsoft.com/cli/azure/
- **Twilio Console:** https://console.twilio.com
- **Cloudinary Console:** https://console.cloudinary.com

---

**Ready to continue? Let me know if you need help with any specific service!**
