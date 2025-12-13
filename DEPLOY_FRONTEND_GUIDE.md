# Deploy Frontend to Azure Static Web Apps

Your backend is live! 🎉 Now let's deploy your frontend.

## Why Azure Static Web Apps?

- ✅ **FREE** tier available
- ✅ Global CDN (fast loading worldwide)
- ✅ Automatic HTTPS
- ✅ Custom domains supported
- ✅ Auto-deploy from GitHub
- ✅ Perfect for Vue.js/Vite apps

---

## Step 1: Create Azure Static Web App

### Via Azure Portal:

1. Go to https://portal.azure.com
2. Click **+ Create a resource**
3. Search: **Static Web App**
4. Click **Create**

### Fill in the details:

**Basics tab:**
- **Subscription**: Your subscription
- **Resource Group**: `church-resources` (same as backend)
- **Name**: `church-website-norway` (or your preferred name)
- **Plan type**: **Free**
- **Region**: Choose closest to you (e.g., West Europe)

**Deployment tab:**
- **Source**: **GitHub**
- Click **Sign in with GitHub**
- **Organization**: Your GitHub username
- **Repository**: `churches-project` (your repo name)
- **Branch**: `main`

**Build Details:**
- **Build Presets**: **Custom**
- **App location**: `/church-website`
- **Api location**: (leave empty)
- **Output location**: `dist`

Click **Review + create** → **Create**

---

## Step 2: Get the Deployment Token

After creation completes:

1. Click **Go to resource**
2. Left sidebar → **Overview**
3. Click **Manage deployment token**
4. Click **Copy** to copy the token
5. **Save this token** - you'll need it for GitHub!

---

## Step 3: Add Token to GitHub Secrets

1. Go to your GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. **Name**: `AZURE_STATIC_WEB_APPS_API_TOKEN`
5. **Value**: Paste the token you copied
6. Click **Add secret**

---

## Step 4: Deploy!

```bash
# Make sure you have the correct backend URL in .env
cat church-website/.env
# Should show: VITE_API_URL=https://church-backend-norway.azurewebsites.net/api

# Commit and push
git add .
git commit -m "Add frontend deployment to Azure Static Web Apps"
git push origin main
```

### Watch the Deployment:

1. Go to GitHub → Your repository → **Actions** tab
2. You should see: "Deploy Frontend to Azure Static Web Apps"
3. Wait 2-3 minutes for completion
4. Look for: ✅ **Build and Deploy** succeeded

---

## Step 5: Get Your Frontend URL

### In Azure Portal:

1. Go to your Static Web App: **church-website-norway**
2. **Overview** page
3. Look for **URL**: `https://church-website-norway-something.azurestaticapps.net`
4. **Copy this URL** - this is your live website!

### Test Your Frontend:

Open the URL in your browser - you should see your church website! 🎉

---

## Step 6: Update Backend CORS

Now that your frontend has a public URL, update the backend to allow requests from it:

### In Azure Portal:

1. Go to **church-backend-norway** (your backend)
2. **Configuration** → **Application settings**
3. Find `WEBSITE_URL`
4. Change from `http://localhost:5178` to your Static Web App URL
   - Example: `https://church-website-norway-abc123.azurestaticapps.net`
5. Click **Save**
6. Click **Continue** (restarts backend)

---

## Step 7: Test Everything! 🎯

### Test your website:

1. **Homepage**: Should load all churches
2. **Church Pages**: Click on a church
3. **Admin Login**: Go to `/admin/login`
4. **Try logging in** with your test credentials

### If login doesn't work:

- Make sure CORS is updated (Step 6)
- Check browser console for errors (F12)
- Verify backend is responding: `https://church-backend-norway.azurewebsites.net/api/churches`

---

## 🎉 Success! You're Live!

Your complete system is now deployed:

```
Frontend (Static Web App)
   ↓
   → https://church-website-norway.azurestaticapps.net
   ↓
Backend (App Service)
   ↓
   → https://church-backend-norway.azurewebsites.net/api
   ↓
Database (PostgreSQL)
   ↓
   → churchserverdevelopment.postgres.database.azure.com
```

---

## Optional: Add Custom Domain

Want to use your own domain (e.g., `mychurch.com`)?

### In Azure Static Web App:

1. **Custom domains** (left sidebar)
2. Click **+ Add**
3. **Domain type**: CNAME
4. Enter your domain
5. Follow the instructions to add DNS records

---

## Automatic Deployments 🚀

From now on:
- Push to `church-website/` folder → Frontend auto-deploys
- Push to `backend/` folder → Backend auto-deploys
- Zero manual work needed!

---

## Troubleshooting

### Frontend shows blank page:

**Check browser console** (F12 → Console tab)

Common issues:
- API URL incorrect in `.env`
- CORS not updated on backend
- Backend not responding

### "Network Error" in console:

**Solution**: Update CORS (Step 6 above)

### Changes not showing:

**Solution**:
1. Clear browser cache (Ctrl+Shift+R)
2. Wait 2-3 minutes after deployment
3. Check GitHub Actions completed successfully

---

## Cost Summary

**FREE Tier Includes:**
- ✅ Azure Static Web App: 100GB bandwidth/month
- ✅ HTTPS/SSL: Automatic
- ✅ CDN: Global distribution
- ✅ Custom domain: Supported

**Backend costs** (~$13/month for B1 tier)

---

## Next Steps

1. ✅ Test all functionality
2. ✅ Change admin passwords (for security)
3. ✅ Add custom domain (optional)
4. ⏳ Deploy SMS app later (as planned)

---

**Your church management system is LIVE! 🎉🎊**
