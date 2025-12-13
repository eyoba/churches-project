# 🔧 Fix: "Basic authentication is disabled" Error

You got this error because Azure disabled basic auth for security. Here are 3 quick solutions:

---

## ⚡ Solution 1: Enable Basic Auth (Fastest - 2 minutes)

This is the quickest fix to get you deploying now.

### Steps:

1. Go to https://portal.azure.com
2. Find your **App Service** (church-backend-api)
3. Left sidebar → **Configuration**
4. Click **General settings** tab at top
5. Scroll down to **Platform settings**
6. Find **SCM Basic Auth Publishing Credentials**
7. Toggle to: **On** ✅
8. Click **Save** at top
9. Click **Continue** to restart

### Now Try Again:

1. Go back to **Overview**
2. Click **Get publish profile** (should work now!)
3. Continue with [AZURE_PORTAL_DEPLOYMENT.md](./AZURE_PORTAL_DEPLOYMENT.md)

---

## 🔐 Solution 2: Use Service Principal (Most Secure - 10 minutes)

This is the modern, secure way. Requires Azure CLI.

### Quick Steps:

1. **Install Azure CLI**: https://aka.ms/installazurecliwindows
2. **Restart terminal**
3. **Run these commands**:

```bash
# Login to Azure
az login

# Get subscription ID
az account show --query id --output tsv

# Create service principal (replace YOUR_SUBSCRIPTION_ID)
az ad sp create-for-rbac \
  --name "github-deploy-church" \
  --role contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/church-resources \
  --sdk-auth
```

4. **Copy the JSON output**
5. **Add to GitHub**:
   - Repository → Settings → Secrets → Actions
   - New secret: `AZURE_CREDENTIALS`
   - Paste the JSON

6. **Replace workflow file**:
   - Delete: `.github/workflows/deploy-backend.yml`
   - Rename: `.github/workflows/deploy-backend-sp.yml` → `deploy-backend.yml`
   - Update app name in line 12

7. **Push to GitHub**:
```bash
git add .
git commit -m "Use Service Principal for deployment"
git push origin main
```

**Full guide**: [AZURE_DEPLOYMENT_FIX.md](./AZURE_DEPLOYMENT_FIX.md)

---

## 🎨 Solution 3: Deploy via VS Code (No CLI, No GitHub - 5 minutes)

Skip GitHub Actions entirely and deploy from VS Code.

### Steps:

1. **Install VS Code Extension**:
   - Open VS Code
   - Extensions (Ctrl+Shift+X)
   - Search: "Azure App Service"
   - Install it

2. **Sign in**:
   - Click Azure icon in left sidebar
   - Sign in to Azure

3. **Deploy**:
   - Right-click `backend` folder
   - "Deploy to Web App..."
   - Select your app: church-backend-api
   - Confirm

Done! No GitHub Actions needed.

---

## 📊 Which Solution Should You Use?

| Solution | Time | Difficulty | Security | Automation |
|----------|------|------------|----------|------------|
| **1. Enable Basic Auth** | 2 min | ⭐ Easy | ⚠️ Medium | ✅ Full |
| **2. Service Principal** | 10 min | ⭐⭐ Medium | ✅ High | ✅ Full |
| **3. VS Code** | 5 min | ⭐ Easy | ✅ High | ❌ Manual |

### My Recommendation:

**For now**: Use **Solution 1** to get deployed quickly

**Later**: Switch to **Solution 2** for better security

---

## ✅ After You Choose

Once you pick a solution and deploy:

1. **Test backend**:
   ```
   https://church-backend-api.azurewebsites.net/api/churches
   ```

2. **Update frontend** (church-website/.env):
   ```env
   VITE_API_URL=https://church-backend-api.azurewebsites.net/api
   ```

3. **Update CORS** in Azure:
   - App Service → Configuration
   - Update `WEBSITE_URL` to your frontend URL

---

## 🆘 Still Having Issues?

1. Check [AZURE_DEPLOYMENT_FIX.md](./AZURE_DEPLOYMENT_FIX.md) for detailed troubleshooting
2. View Azure logs: Portal → App Service → Log stream
3. Check GitHub Actions: Repository → Actions tab

---

**Quick Decision Help:**

- **Want to deploy NOW?** → Solution 1 (Enable Basic Auth)
- **Want best security?** → Solution 2 (Service Principal)
- **Don't want GitHub Actions?** → Solution 3 (VS Code)

Pick one and follow the steps above! 🚀
