# Azure Deployment - Service Principal Method

Azure has disabled basic authentication for publish profiles. We'll use **Service Principal** authentication instead (more secure!).

## Quick Fix: Two Alternative Methods

Choose either method below:

---

## Method 1: Enable Basic Auth (Quick but Less Secure) ⚠️

This enables the publish profile download temporarily.

### Via Azure Portal:

1. Go to https://portal.azure.com
2. Navigate to your **App Service** → **church-backend-api**
3. Left sidebar → **Configuration**
4. Click **General settings** tab
5. Scroll down to **SCM Basic Auth Publishing Credentials**
6. Set to: **On**
7. Click **Save**

Now you can download the publish profile:
1. Go back to **Overview**
2. Click **Get publish profile**
3. Continue with [AZURE_PORTAL_DEPLOYMENT.md](./AZURE_PORTAL_DEPLOYMENT.md) Step 4

⚠️ **Note**: This is less secure. After deployment works, consider switching to Method 2.

---

## Method 2: Use Service Principal (Recommended - More Secure) ✅

This uses Azure's modern authentication system.

### Step 1: Install Azure CLI (If Not Already)

**Windows:**
```powershell
winget install -e --id Microsoft.AzureCLI
```

Or download from: https://aka.ms/installazurecliwindows

**Restart your terminal** after installation.

### Step 2: Login to Azure

```bash
az login
```

This opens your browser for authentication.

### Step 3: Get Your Subscription ID

```bash
az account show --query id --output tsv
```

Copy the output (your subscription ID).

### Step 4: Create Service Principal

```bash
# Set variables (replace with your values)
SUBSCRIPTION_ID="your-subscription-id-from-step-3"
RESOURCE_GROUP="church-resources"  # Or your resource group name
APP_NAME="church-backend-api"      # Your app service name

# Create service principal
az ad sp create-for-rbac \
  --name "github-deploy-church-backend" \
  --role contributor \
  --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP \
  --sdk-auth
```

This outputs JSON like:
```json
{
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  ...
}
```

**⚠️ COPY THIS ENTIRE JSON OUTPUT - YOU'LL NEED IT!**

### Step 5: Add to GitHub Secrets

1. Go to your GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `AZURE_CREDENTIALS`
5. Value: Paste the entire JSON from Step 4
6. Click **Add secret**

### Step 6: Update GitHub Workflow

We need to modify the workflow to use Service Principal instead of publish profile.

Open `.github/workflows/deploy-backend.yml` and replace its contents:

```yaml
name: Deploy Backend to Azure App Service

on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'
      - '.github/workflows/deploy-backend.yml'
  workflow_dispatch: # Allow manual trigger

env:
  AZURE_WEBAPP_NAME: church-backend-api    # Replace with your Azure Web App name
  AZURE_WEBAPP_PACKAGE_PATH: 'backend'
  NODE_VERSION: '18.x'
  RESOURCE_GROUP: church-resources         # Replace with your resource group name

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        cache-dependency-path: '${{ env.AZURE_WEBAPP_PACKAGE_PATH }}/package-lock.json'

    - name: Install dependencies
      run: |
        cd ${{ env.AZURE_WEBAPP_PACKAGE_PATH }}
        npm ci --omit=dev

    - name: Login to Azure
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}

    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: ${{ env.AZURE_WEBAPP_NAME }}
        package: ${{ env.AZURE_WEBAPP_PACKAGE_PATH }}

    - name: Logout from Azure
      run: |
        az logout

    - name: Deployment notification
      if: success()
      run: |
        echo "✅ Backend deployed successfully to https://${{ env.AZURE_WEBAPP_NAME }}.azurewebsites.net"
```

**Important**: Update line 9 and 12 with YOUR values:
```yaml
AZURE_WEBAPP_NAME: church-backend-api     # Your actual app name
RESOURCE_GROUP: church-resources          # Your actual resource group
```

### Step 7: Commit and Deploy

```bash
git add .
git commit -m "Update deployment to use Service Principal"
git push origin main
```

### Step 8: Monitor Deployment

1. Go to GitHub → Your repository → **Actions** tab
2. Watch the workflow run
3. Should complete in 2-3 minutes

---

## Method 3: Deploy via VS Code (No GitHub Actions)

If GitHub Actions isn't working, deploy directly from VS Code:

### Step 1: Install VS Code Azure Extension

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search: **Azure App Service**
4. Install the official Microsoft extension

### Step 2: Sign in to Azure

1. Click Azure icon in left sidebar
2. Click **Sign in to Azure**
3. Follow authentication

### Step 3: Deploy

1. Right-click on `backend` folder in VS Code
2. Select **Deploy to Web App...**
3. Choose your subscription
4. Select **church-backend-api**
5. Confirm deployment

---

## Quick Comparison

| Method | Security | Ease | Speed |
|--------|----------|------|-------|
| Enable Basic Auth | ⚠️ Low | ✅ Easy | ⚡ Fast |
| Service Principal | ✅ High | 🔧 Medium | ⚡ Fast |
| VS Code | ✅ High | ✅ Easy | 🐌 Slower |

**Recommendation**: Use **Method 2 (Service Principal)** for production. It's the most secure and modern approach.

---

## Troubleshooting

### Issue: "az: command not found"

**Solution**: Install Azure CLI first:
- Windows: https://aka.ms/installazurecliwindows
- Restart terminal after installation

### Issue: Service Principal creation fails

**Solution**: You might not have permission. Use Method 1 (Basic Auth) instead.

### Issue: GitHub Action fails with "Login failed"

**Solution**:
1. Verify `AZURE_CREDENTIALS` secret contains the complete JSON
2. Ensure service principal has contributor role
3. Try recreating the service principal

### Issue: Deployment succeeds but app doesn't work

**Solution**:
1. Check environment variables in Azure Portal
2. View logs: App Service → Log stream
3. Verify DATABASE_URL is correct

---

## After Deployment Works

Once deployed successfully:

1. **Test your backend**:
   ```bash
   curl https://church-backend-api.azurewebsites.net/api/churches
   ```

2. **Update frontend** (`church-website/.env`):
   ```env
   VITE_API_URL=https://church-backend-api.azurewebsites.net/api
   ```

3. **Update CORS** (Azure Portal → App Service → Configuration):
   - Find `WEBSITE_URL`
   - Update to your frontend URL
   - Save

---

## Security Best Practices

After using Method 1 (Basic Auth), switch to Service Principal:
1. Follow Method 2 instructions
2. After it works, disable Basic Auth:
   - App Service → Configuration → General settings
   - SCM Basic Auth: **Off**
   - Save

---

**Need Help?**
- Azure CLI docs: https://docs.microsoft.com/cli/azure/
- Service Principal: https://docs.microsoft.com/azure/developer/github/connect-from-azure
