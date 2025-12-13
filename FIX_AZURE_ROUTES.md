# Fix: "Cannot GET /api/churches" Error

Your backend deployed but isn't running properly on Azure. Let's fix it!

## Quick Diagnosis

The error means:
- ✅ Deployment succeeded
- ✅ Files are on Azure
- ❌ Backend server isn't starting or running correctly

---

## Solution 1: Check Azure Logs (Do This First!)

### Via Azure Portal:

1. Go to https://portal.azure.com
2. Find your App Service: **church-backend-norway**
3. Left sidebar → **Log stream**
4. Wait 10-20 seconds for logs to appear

**Look for:**
- ❌ Error messages (red text)
- ❌ "Database connection failed"
- ❌ Missing environment variables
- ✅ "Database connected successfully"
- ✅ "Running on port..."

**Screenshot the logs and check what errors you see!**

---

## Solution 2: Verify Environment Variables

Your backend REQUIRES these variables to start:

### Check in Azure Portal:

1. App Service → **Configuration** (left sidebar)
2. Click **Application settings** tab
3. **Verify these exist**:

| Name | Should Be Set |
|------|---------------|
| `DATABASE_URL` | ✅ Your PostgreSQL connection string |
| `JWT_SECRET` | ✅ Your JWT secret |
| `NODE_ENV` | ✅ `production` |
| `BACKEND_URL` | ✅ `https://church-backend-norway.azurewebsites.net` |
| `WEBSITE_URL` | ✅ Your frontend URL |
| `SMS_APP_URL` | ✅ Can be `http://localhost:5179` for now |

### If ANY are missing:

1. Click **+ New application setting**
2. Add the missing variable
3. Click **Save** at top
4. Click **Continue** (app will restart)

---

## Solution 3: Set Startup Command

Azure might not know which file to run.

### Via Azure Portal:

1. App Service → **Configuration**
2. Click **General settings** tab
3. Find **Startup Command**
4. Enter: `npm start`
5. Click **Save**
6. Click **Continue** (app will restart)

---

## Solution 4: Check Node.js Version

### Via Azure Portal:

1. App Service → **Configuration**
2. **General settings** tab
3. Find **Stack settings**
4. **Runtime stack**: Should be `Node`
5. **Major version**: Should be `18 LTS`
6. **Minor version**: Should be latest (18.x)

If not:
1. Change to Node 18 LTS
2. **Save**

---

## Solution 5: Enable Detailed Logging

Get more information about what's failing:

### Via Azure Portal:

1. App Service → **App Service logs** (left sidebar)
2. Set these:
   - **Application Logging (Filesystem)**: `Error` or `Information`
   - **Detailed Error Messages**: `On`
   - **Failed Request Tracing**: `On`
3. Click **Save**
4. Go back to **Log stream** to see detailed logs

---

## Solution 6: Manual Restart

Sometimes Azure just needs a restart:

### Via Azure Portal:

1. App Service → **Overview**
2. Top toolbar → Click **Restart**
3. Click **Yes** to confirm
4. Wait 30-60 seconds
5. Try your URL again: `https://church-backend-norway.azurewebsites.net/api/churches`

---

## Solution 7: Test Root Route

Your server might be running but only on wrong routes:

Try these URLs:
- `https://church-backend-norway.azurewebsites.net/` (root)
- `https://church-backend-norway.azurewebsites.net/api/churches` (your route)

If root works but /api/churches doesn't, the server IS running but routes are wrong.

---

## Most Common Issues (Check These!)

### Issue 1: Missing DATABASE_URL ⚠️ **MOST COMMON**

**Symptom**: Server crashes on startup

**Fix**:
1. App Service → Configuration
2. Add `DATABASE_URL` with your full PostgreSQL connection string:
   ```
   postgresql://church_user:PASSWORD@churchserverdevelopment.postgres.database.azure.com:5432/church_pgdatabase?sslmode=require
   ```
3. Save and restart

### Issue 2: PostgreSQL Firewall 🔥 **SECOND MOST COMMON**

**Symptom**: "Database connection failed" in logs

**Fix**:
1. Azure Portal → PostgreSQL flexible server
2. **Networking** → Firewall rules
3. ✅ Check: "Allow Azure services"
4. Save

### Issue 3: Wrong PORT

**Symptom**: App times out or "Cannot GET"

**Fix**: Azure automatically sets PORT. Your code should use `process.env.PORT` (which you do ✅)

### Issue 4: Missing npm start

**Symptom**: Azure doesn't know how to start app

**Fix**: Set startup command to `npm start` (Solution 3 above)

---

## Quick Checklist

Go through this in order:

- [ ] 1. Check **Log stream** for errors
- [ ] 2. Verify **all environment variables** are set
- [ ] 3. Verify **DATABASE_URL** is correct
- [ ] 4. Check **PostgreSQL firewall** allows Azure services
- [ ] 5. Set **Startup Command** to `npm start`
- [ ] 6. Verify **Node 18 LTS** is selected
- [ ] 7. **Restart** the App Service
- [ ] 8. Test URL again

---

## After Fixing

Once you see this in logs:
```
✅ Database connected successfully
✅ Running on port 8080 (or whatever port)
```

Your API should work:
```
https://church-backend-norway.azurewebsites.net/api/churches
```

Should return JSON with your churches! 🎉

---

## Need More Help?

**Tell me what you see in the logs!**

Go to App Service → Log stream, and share:
- Any error messages (red text)
- Any warnings (yellow text)
- What the last log line says

I can help debug based on the specific error!

---

## Alternative: Deploy via VS Code

If nothing works, try deploying directly from VS Code:

1. Install Azure App Service extension
2. Right-click `backend` folder
3. "Deploy to Web App..."
4. Select church-backend-norway

This sometimes works when GitHub Actions deployment has issues.
