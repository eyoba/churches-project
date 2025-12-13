# Azure Portal Deployment Guide (No CLI Required)

This guide uses the Azure Portal web interface - no command-line tools needed!

## Prerequisites

- Azure account (sign up at https://azure.microsoft.com/free/)
- GitHub account
- Web browser

---

## Step 1: Fix PostgreSQL Firewall (5 minutes) 🔥 CRITICAL

This is the most important step - do this first!

1. Go to https://portal.azure.com
2. Sign in with your Azure account
3. In the search bar at top, type: **PostgreSQL flexible servers**
4. Click on your server: **churchserverdevelopment**
5. In the left sidebar, click **Networking**
6. Under "Firewall rules":
   - ✅ Check: **"Allow public access from any Azure service within Azure to this server"**
   - Click **"+ Add current client IP address"** button
7. Click **Save** at the top

✅ **This fixes:**
- Your local "Failed to load churches" issue
- Allows your Azure App Service to connect to the database

---

## Step 2: Create App Service (10 minutes)

### 2.1 Create Resource Group (if needed)

1. In Azure Portal search bar, type: **Resource groups**
2. Click **+ Create**
3. Fill in:
   - **Subscription**: Select your subscription
   - **Resource group**: `church-resources`
   - **Region**: `East US` (or closest to you)
4. Click **Review + create** → **Create**

### 2.2 Create App Service

1. In Azure Portal search bar, type: **App Services**
2. Click **+ Create** → **Web App**
3. Fill in **Basics** tab:
   - **Subscription**: Your subscription
   - **Resource Group**: `church-resources`
   - **Name**: `church-backend-api-YOURNAME` (must be globally unique!)
     - Example: `church-backend-api-john`
     - This will be your URL: `https://church-backend-api-john.azurewebsites.net`
   - **Publish**: `Code`
   - **Runtime stack**: `Node 18 LTS`
   - **Operating System**: `Linux`
   - **Region**: `East US` (same as resource group)

4. **Pricing Plan** section:
   - Click **"Explore pricing plans"**
   - Select **Basic B1** (~$13/month) or **Free F1** ($0/month for testing)
   - Click **Select**

5. Click **Review + create** → **Create**
6. Wait 1-2 minutes for deployment
7. Click **Go to resource**

✅ **Save your App Service URL**: `https://church-backend-api-YOURNAME.azurewebsites.net`

---

## Step 3: Configure Environment Variables (10 minutes)

1. In your App Service, find **Configuration** in left sidebar
2. Click **+ New application setting** for each variable below:

### Required Variables:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://church_user:Debreiyesus2026@churchserverdevelopment.postgres.database.azure.com:5432/church_pgdatabase?sslmode=require` |
| `JWT_SECRET` | `d42f911fd925cbfbfb8d49cc5e901449bbf3979afd28a691957f3b5988074871` |
| `NODE_ENV` | `production` |
| `BACKEND_URL` | `https://church-backend-api-YOURNAME.azurewebsites.net` (use YOUR URL) |
| `WEBSITE_URL` | `http://localhost:5178` (will update after frontend deployment) |
| `SMS_APP_URL` | `http://localhost:5179` |

### Optional Variables (can add later):

| Name | Value |
|------|-------|
| `TWILIO_ACCOUNT_SID` | Your Twilio SID (if you have it) |
| `TWILIO_AUTH_TOKEN` | Your Twilio token |
| `TWILIO_PHONE_NUMBER` | Your Twilio number |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary name |
| `CLOUDINARY_API_KEY` | Your Cloudinary key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary secret |

3. After adding all variables, click **Save** at the top
4. Click **Continue** when prompted (app will restart)

---

## Step 4: Get Publish Profile for GitHub Actions (5 minutes)

1. In your App Service, click **Overview** in left sidebar
2. Click **Get publish profile** in the top toolbar
3. A file will download (e.g., `church-backend-api-YOURNAME.PublishSettings`)
4. Open this file with Notepad
5. **Copy ALL the contents** (Ctrl+A, Ctrl+C)

---

## Step 5: Add GitHub Secret (5 minutes)

1. Go to your GitHub repository: https://github.com/YOUR_USERNAME/churches-project
2. Click **Settings** tab (at top)
3. In left sidebar: **Secrets and variables** → **Actions**
4. Click **New repository secret** button
5. Fill in:
   - **Name**: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - **Secret**: Paste the entire publish profile content
6. Click **Add secret**

---

## Step 6: Update GitHub Workflow File (2 minutes)

1. Open your repository in VS Code or GitHub web editor
2. Open file: `.github/workflows/deploy-backend.yml`
3. Find line 9 (under `env:`):
   ```yaml
   AZURE_WEBAPP_NAME: church-backend-api    # Replace with your Azure Web App name
   ```
4. Change it to YOUR app name:
   ```yaml
   AZURE_WEBAPP_NAME: church-backend-api-YOURNAME    # Your actual name
   ```
5. Save the file

---

## Step 7: Deploy! (5 minutes)

### Commit and Push:

```bash
git add .
git commit -m "Setup Azure deployment configuration"
git push origin main
```

### Watch Deployment:

1. Go to your GitHub repository
2. Click **Actions** tab
3. You should see a workflow running: "Deploy Backend to Azure App Service"
4. Click on it to watch progress
5. Wait 2-3 minutes for deployment to complete
6. Look for: ✅ "Backend deployed successfully"

---

## Step 8: Test Your Deployment (2 minutes)

### Test in Browser:

Open: `https://church-backend-api-YOURNAME.azurewebsites.net/api/churches`

**Expected**: JSON data with your churches

### Test Database Connection:

Check the App Service logs:

1. In Azure Portal → Your App Service
2. Left sidebar → **Log stream**
3. Look for: `✅ Database connected successfully`

---

## Step 9: Update Your Local Frontend (1 minute)

Edit `church-website/.env`:

```env
VITE_API_URL=https://church-backend-api-YOURNAME.azurewebsites.net/api
```

Restart your frontend to test with the deployed backend!

---

## 🎉 Success Checklist

- ✅ PostgreSQL firewall allows Azure services
- ✅ App Service created and running
- ✅ Environment variables configured
- ✅ GitHub Actions deployed successfully
- ✅ Backend API responds to requests
- ✅ Database connection working

---

## 🔧 Troubleshooting

### Issue: 502 Bad Gateway

**Solution**: Wait 2-3 minutes after deployment. Azure needs time to start the app.

### Issue: Can't connect to database

**Solution**:
1. Check PostgreSQL firewall (Step 1)
2. Verify DATABASE_URL in App Service Configuration

### Issue: GitHub Action fails

**Solutions**:
- Verify publish profile secret name is exactly: `AZURE_WEBAPP_PUBLISH_PROFILE`
- Verify AZURE_WEBAPP_NAME matches your app name
- Try downloading fresh publish profile

### Issue: CORS error in frontend

**Solution**: Update WEBSITE_URL in Azure App Service Configuration:
1. App Service → Configuration
2. Find WEBSITE_URL
3. Update to your frontend URL
4. Save

### View Logs:

1. Azure Portal → Your App Service
2. Left sidebar → **Log stream**
3. Or use: **Diagnose and solve problems**

---

## 📊 What You've Deployed

```
┌─────────────────────────────────────────┐
│  Your GitHub Repository                 │
│  (Push to main branch)                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  GitHub Actions (Automated CI/CD)       │
│  - Installs dependencies                │
│  - Deploys to Azure                     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Azure App Service                      │
│  - Node.js 18 LTS                       │
│  - Your Backend API                     │
│  - https://your-app.azurewebsites.net   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Azure PostgreSQL Database              │
│  - churchserverdevelopment              │
│  - Your churches data                   │
└─────────────────────────────────────────┘
```

---

## 💡 Pro Tips

1. **Always test locally first** before pushing to GitHub
2. **Check logs** if something goes wrong (Log stream in Azure)
3. **Free tier limitations**:
   - 60 minutes/day compute time
   - Sleeps after 20 minutes of inactivity
   - Use B1 ($13/month) for production

4. **Custom Domain** (optional):
   - App Service → Custom domains
   - Add your own domain

5. **SSL Certificate**: Already enabled by Azure! (HTTPS automatic)

---

## 🎯 Next Steps

1. ✅ Backend deployed to Azure
2. 🔄 Deploy frontend (church-website) to Azure Static Web Apps
3. 🔄 Update WEBSITE_URL in backend configuration
4. ⏳ SMS app deployment (later as planned)

---

## 📞 Need Help?

- **Azure Portal**: https://portal.azure.com
- **Azure Support**: https://azure.microsoft.com/support/
- **GitHub Actions**: https://github.com/YOUR_USERNAME/churches-project/actions

---

**Total Time**: ~45 minutes
**Cost**: $0-13/month depending on plan chosen

🎉 Your backend is now production-ready on Azure!
