# Quick Deploy Checklist ✅

Follow these steps in order to deploy your backend to Azure.

## ⚠️ Before You Start

- [ ] Azure CLI installed (`az --version`)
- [ ] Logged into Azure (`az login`)
- [ ] GitHub account connected to your repository

## 1️⃣ Fix Database Firewall (5 minutes)

### Via Azure Portal (Easiest):
1. Go to https://portal.azure.com
2. **PostgreSQL flexible servers** → **churchserverdevelopment** → **Networking**
3. Check: ✅ **"Allow Azure services"**
4. Click: **"Add current client IP"**
5. Click: **Save**

### Via CLI:
```bash
# Find resource group
az postgres flexible-server list --output table

# Allow Azure services (required!)
az postgres flexible-server firewall-rule create \
  --resource-group <YOUR-RESOURCE-GROUP> \
  --name churchserverdevelopment \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

## 2️⃣ Create Azure App Service (10 minutes)

```bash
# Set your variables (customize WEBAPP_NAME - must be globally unique!)
RESOURCE_GROUP="church-resources"
WEBAPP_NAME="church-backend-api-your-name"  # ← CHANGE THIS!

# Create resource group
az group create --name $RESOURCE_GROUP --location eastus

# Create App Service Plan
az appservice plan create \
  --name church-backend-plan \
  --resource-group $RESOURCE_GROUP \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan church-backend-plan \
  --name $WEBAPP_NAME \
  --runtime "NODE:18-lts"
```

✅ Your backend URL: `https://<WEBAPP_NAME>.azurewebsites.net`

## 3️⃣ Configure Environment Variables (5 minutes)

```bash
# Replace values with your actual data!
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $WEBAPP_NAME \
  --settings \
    DATABASE_URL="postgresql://church_user:Debreiyesus2026@churchserverdevelopment.postgres.database.azure.com:5432/church_pgdatabase?sslmode=require" \
    JWT_SECRET="d42f911fd925cbfbfb8d49cc5e901449bbf3979afd28a691957f3b5988074871" \
    NODE_ENV="production" \
    BACKEND_URL="https://$WEBAPP_NAME.azurewebsites.net" \
    WEBSITE_URL="https://your-frontend-url-here.com" \
    SMS_APP_URL="http://localhost:5179"
```

## 4️⃣ Setup GitHub Actions (5 minutes)

### Get Publish Profile:
```bash
az webapp deployment list-publishing-profiles \
  --resource-group $RESOURCE_GROUP \
  --name $WEBAPP_NAME \
  --xml
```

Copy the entire XML output.

### Add to GitHub:
1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
4. Value: Paste the XML
5. **Add secret**

### Update Workflow File:

Edit `.github/workflows/deploy-backend.yml` line 9:
```yaml
AZURE_WEBAPP_NAME: church-backend-api-your-name  # ← Your webapp name here
```

## 5️⃣ Deploy! (2 minutes)

```bash
git add .
git commit -m "Setup Azure deployment"
git push origin main
```

Watch deployment: https://github.com/YOUR_USERNAME/churches-project/actions

## 6️⃣ Verify (1 minute)

```bash
# Test your backend
curl https://$WEBAPP_NAME.azurewebsites.net/api/churches
```

Should return JSON with your churches! 🎉

## 7️⃣ Update Frontend

Edit `church-website/.env`:
```env
VITE_API_URL=https://church-backend-api-your-name.azurewebsites.net/api
```

## 📋 Summary

**Total Time**: ~30 minutes

**What You Created:**
- ✅ Azure App Service running your backend
- ✅ PostgreSQL firewall configured
- ✅ Automated CI/CD with GitHub Actions
- ✅ Environment variables configured
- ✅ Production-ready backend API

**Your Backend URL:**
`https://<your-webapp-name>.azurewebsites.net/api`

## 🆘 Need Help?

See full guide: [AZURE_DEPLOYMENT_GUIDE.md](./AZURE_DEPLOYMENT_GUIDE.md)

---

**Next Steps:**
1. Deploy frontend to Azure Static Web Apps
2. Update CORS settings with production URL
3. Test end-to-end functionality
