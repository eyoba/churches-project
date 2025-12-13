# Azure Deployment Guide - Backend API

This guide will help you deploy your Church Management System backend to Azure App Service with automated CI/CD via GitHub Actions.

## Prerequisites

- Azure account with active subscription
- Azure CLI installed (`az --version` to check)
- GitHub repository for your project
- Your Azure PostgreSQL database already configured ✅

## Step 1: Fix Azure PostgreSQL Firewall (IMPORTANT!)

### Option A: Via Azure Portal (Recommended - 2 minutes)

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to: **PostgreSQL flexible servers** → **churchserverdevelopment**
3. Click **Networking** (left sidebar)
4. Enable these settings:
   - ✅ **"Allow public access from any Azure service within Azure to this server"**
   - ✅ Click **"Add current client IP address"** (for local dev)
5. Click **Save**

### Option B: Via Azure CLI

```bash
# Find your resource group
az postgres flexible-server list --query "[].{Name:name, ResourceGroup:resourceGroup}" --output table

# Allow Azure services (required for App Service)
az postgres flexible-server firewall-rule create \
  --resource-group <your-resource-group> \
  --name churchserverdevelopment \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Allow your current IP (for local development)
az postgres flexible-server firewall-rule create \
  --resource-group <your-resource-group> \
  --name churchserverdevelopment \
  --rule-name AllowMyCurrentIP \
  --start-ip-address $(curl -4 -s ifconfig.me) \
  --end-ip-address $(curl -4 -s ifconfig.me)
```

## Step 2: Create Azure App Service

```bash
# Login to Azure
az login

# Set variables (customize these)
RESOURCE_GROUP="church-resources"
LOCATION="eastus"
APP_SERVICE_PLAN="church-backend-plan"
WEBAPP_NAME="church-backend-api"  # Must be globally unique!

# Create resource group (skip if you already have one)
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create App Service Plan (B1 tier - production ready)
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --sku B1 \
  --is-linux

# Create Web App (Node.js 18 LTS)
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --name $WEBAPP_NAME \
  --runtime "NODE:18-lts"

echo "✅ Web App created: https://$WEBAPP_NAME.azurewebsites.net"
```

## Step 3: Configure Environment Variables in Azure

⚠️ **Replace the values below with your actual credentials!**

```bash
# Set all environment variables at once
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $WEBAPP_NAME \
  --settings \
    DATABASE_URL="postgresql://church_user:Debreiyesus2026@churchserverdevelopment.postgres.database.azure.com:5432/church_pgdatabase?sslmode=require" \
    JWT_SECRET="d42f911fd925cbfbfb8d49cc5e901449bbf3979afd28a691957f3b5988074871" \
    NODE_ENV="production" \
    WEBSITE_URL="https://your-frontend-url.azurestaticapps.net" \
    SMS_APP_URL="http://localhost:5179" \
    BACKEND_URL="https://$WEBAPP_NAME.azurewebsites.net" \
    TWILIO_ACCOUNT_SID="your_account_sid" \
    TWILIO_AUTH_TOKEN="your_auth_token" \
    TWILIO_PHONE_NUMBER="+1234567890" \
    CLOUDINARY_CLOUD_NAME="your_cloud_name" \
    CLOUDINARY_API_KEY="your_api_key" \
    CLOUDINARY_API_SECRET="your_api_secret"

echo "✅ Environment variables configured"
```

### Alternative: Set via Azure Portal

1. Go to Azure Portal → App Services → Your app
2. Click **Configuration** (left sidebar)
3. Click **+ New application setting** for each variable
4. Add all variables from the command above
5. Click **Save** at the top

## Step 4: Get Publish Profile for GitHub Actions

```bash
# Download publish profile
az webapp deployment list-publishing-profiles \
  --resource-group $RESOURCE_GROUP \
  --name $WEBAPP_NAME \
  --xml > publish-profile.xml

echo "✅ Publish profile saved to publish-profile.xml"
echo "Copy the contents of this file for the next step"
```

Or via Azure Portal:
1. Go to Azure Portal → App Services → Your app
2. Click **Get publish profile** (top toolbar)
3. Open the downloaded file and copy ALL contents

## Step 5: Add GitHub Secret

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
5. Value: Paste the **entire contents** of publish-profile.xml
6. Click **Add secret**

## Step 6: Update GitHub Workflow

Edit `.github/workflows/deploy-backend.yml` and replace:

```yaml
env:
  AZURE_WEBAPP_NAME: church-backend-api    # ← Change this to YOUR webapp name
```

## Step 7: Deploy!

### Option A: Automatic Deployment (Recommended)

```bash
# Commit and push your changes
git add .
git commit -m "Add Azure deployment configuration"
git push origin main
```

The GitHub Action will automatically deploy your backend! 🚀

Monitor the deployment:
1. Go to your GitHub repository
2. Click **Actions** tab
3. Watch the deployment progress

### Option B: Manual Deployment

```bash
cd backend

# Install production dependencies
npm ci --omit=dev

# Deploy to Azure
az webapp up \
  --resource-group $RESOURCE_GROUP \
  --name $WEBAPP_NAME \
  --runtime "NODE:18-lts"
```

## Step 8: Verify Deployment

```bash
# Check if the backend is running
curl https://$WEBAPP_NAME.azurewebsites.net/api/churches

# Should return JSON with your churches data
```

Or open in browser: `https://your-app-name.azurewebsites.net/api/churches`

## Step 9: Update Frontend

Update your frontend `.env` file to point to Azure:


```env
VITE_API_URL=https://church-backend-api.azurewebsites.net/api
```

## Troubleshooting

### Issue: "Failed to connect to database"

**Solution**: Check Azure PostgreSQL firewall rules (Step 1)

```bash
# Verify firewall rules
az postgres flexible-server firewall-rule list \
  --resource-group <your-resource-group> \
  --name churchserverdevelopment \
  --output table
```

### Issue: "CORS error"

**Solution**: Update WEBSITE_URL in Azure App Settings

```bash
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $WEBAPP_NAME \
  --settings WEBSITE_URL="https://your-actual-frontend-url.com"
```

### Issue: GitHub Action fails

**Solution**: Check publish profile secret

1. Verify the secret name is exactly: `AZURE_WEBAPP_PUBLISH_PROFILE`
2. Ensure you copied the **entire** XML content
3. Try downloading a fresh publish profile

### Issue: 500 Error after deployment

**Solution**: Check application logs

```bash
# View logs
az webapp log tail \
  --resource-group $RESOURCE_GROUP \
  --name $WEBAPP_NAME
```

Or via Azure Portal:
1. App Services → Your app → Log stream

## Monitoring

### View Application Logs

```bash
# Enable logging
az webapp log config \
  --resource-group $RESOURCE_GROUP \
  --name $WEBAPP_NAME \
  --application-logging filesystem \
  --level information

# Stream logs
az webapp log tail \
  --resource-group $RESOURCE_GROUP \
  --name $WEBAPP_NAME
```

### Check App Status

```bash
# Get app details
az webapp show \
  --resource-group $RESOURCE_GROUP \
  --name $WEBAPP_NAME \
  --query "{Name:name, State:state, DefaultHostName:defaultHostName}" \
  --output table
```

## Cost Optimization

- **B1 Plan**: ~$13/month (recommended for production)
- **F1 (Free) Plan**: $0/month (for testing only, has limitations)

To switch to Free tier (for testing):
```bash
az appservice plan update \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --sku FREE
```

## Next Steps

1. ✅ Deploy your frontend (church-website) to Azure Static Web Apps
2. ✅ Update CORS settings with production frontend URL
3. ✅ Set up custom domain (optional)
4. ✅ Enable HTTPS (automatic on Azure)
5. ⏳ Deploy SMS app later (as planned)

## Important URLs

- **Backend API**: `https://church-backend-api.azurewebsites.net/api`
- **Azure Portal**: https://portal.azure.com
- **GitHub Actions**: https://github.com/YOUR_USERNAME/churches-project/actions

## Need Help?

- Azure Documentation: https://docs.microsoft.com/azure/app-service/
- GitHub Actions: https://docs.github.com/actions

---

**Generated with Claude Code** 🤖
