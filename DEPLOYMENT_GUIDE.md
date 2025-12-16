# Azure Deployment Guide - Members Management System

## Overview

The members management system consists of:
1. **Frontend**: Static website hosted on Azure App Service (fnatewahedo)
2. **Main Backend**: Node.js API on Azure App Service (church-backend-norway)
3. **Members Backend**: NEW - Node.js API for members system (church-members-backend)

## Step 1: Create Azure App Service for Members Backend

### Option A: Using Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Create new **App Service**:
   - **Name**: `church-members-backend`
   - **Runtime**: Node 18 LTS
   - **Operating System**: Linux
   - **Region**: Same as your other services (Norway East)
   - **Pricing tier**: Same as your current backend

### Option B: Using Azure CLI

```bash
# Login to Azure
az login

# Create the App Service
az webapp create \
  --resource-group your-resource-group \
  --plan your-app-service-plan \
  --name church-members-backend \
  --runtime "NODE:18-lts"
```

## Step 2: Configure Environment Variables

In Azure Portal, go to **church-members-backend** → **Configuration** → **Application settings**

Add these environment variables:

```
PORT=3002
DATABASE_URL=postgresql://username:password@your-server.postgres.database.azure.com:5432/database_name?sslmode=require&connect_timeout=10&application_name=members-backend
JWT_SECRET=your_jwt_secret_here
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
FRONTEND_URL=https://fnatewahedo.azurewebsites.net
NODE_ENV=production
```

**Optional** (only when Twilio account is upgraded to paid):
```
SMS_SENDER_ID=DEBREIYESUS
```

Click **Save** and **Restart** the app.

## Step 3: Get Publish Profile

1. In Azure Portal, go to **church-members-backend**
2. Click **Download publish profile**
3. Open the downloaded file and copy its contents

## Step 4: Add GitHub Secret

1. Go to your GitHub repository: https://github.com/eyoba/churches-project
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `AZURE_MEMBERS_BACKEND_PUBLISH_PROFILE`
5. Value: Paste the publish profile content
6. Click **Add secret**

## Step 5: Initialize Database

After deploying the backend, you need to set up the database tables:

### Option A: Using Azure Console

1. Go to Azure Portal → **church-members-backend**
2. Click **Console** (under Development Tools)
3. Run:
```bash
node setup-database.js
```

### Option B: Using SSH

1. Enable SSH in Azure Portal
2. Connect via SSH
3. Run:
```bash
cd /home/site/wwwroot
node setup-database.js
```

This will create:
- `members` table
- `members_admins` table (with default admin user)
- `sms_logs` table
- `sms_recipients` table
- `audit_log` table

**Default admin credentials:**
- Username: `admin`
- Password: `admin123`

**IMPORTANT**: Change the admin password after first login!

## Step 6: Update Frontend Deployment Configuration

The frontend deployment has been updated to use the new members backend URL.

**Already configured in GitHub Actions:**
```yaml
VITE_MEMBERS_API_URL: https://church-members-backend.azurewebsites.net
```

## Step 7: Deploy Everything

### Deploy Members Backend

Push to GitHub or trigger manually:

```bash
# Option 1: Push changes
git push origin main

# Option 2: Manual trigger via GitHub Actions
# Go to: https://github.com/eyoba/churches-project/actions
# Select "Deploy Members Backend to Azure App Service"
# Click "Run workflow"
```

### Deploy Frontend

The frontend will automatically redeploy when you push changes to `church-website/**` or trigger manually.

## Step 8: Verify Deployment

### Test Members Backend

1. Check health endpoint:
```bash
curl https://church-members-backend.azurewebsites.net/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-16T..."
}
```

2. Test login:
```bash
curl -X POST https://church-members-backend.azurewebsites.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "admin",
    "full_name": "System Administrator"
  }
}
```

### Test Frontend

1. Visit: https://fnatewahedo.azurewebsites.net/members/login
2. Login with: `admin` / `admin123`
3. Test all features:
   - View members list
   - Add new member
   - Send SMS (if Twilio is configured)
   - View SMS history

## Troubleshooting

### Backend Not Starting

1. Check Application Insights logs in Azure Portal
2. Verify all environment variables are set correctly
3. Check that DATABASE_URL is correct
4. Restart the app service

### Database Connection Issues

1. Verify PostgreSQL firewall rules allow Azure services
2. Check DATABASE_URL connection string
3. Test database connectivity from Azure Console:
```bash
node -e "require('pg').Pool(process.env.DATABASE_URL).query('SELECT NOW()').then(console.log)"
```

### SMS Not Working

1. Verify Twilio credentials in environment variables
2. Check Twilio console for error messages
3. Remember: Trial accounts have "Sent from your Twilio trial account -" prefix
4. Upgrade to paid account to remove prefix and use alphanumeric sender ID

### Frontend Can't Connect to Backend

1. Check that VITE_MEMBERS_API_URL is set correctly during build
2. Check browser console for CORS errors
3. Verify FRONTEND_URL is set in backend environment variables
4. Check Azure App Service logs for errors

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   Frontend: fnatewahedo.azurewebsites.net          │
│   (Vue.js Static Website)                          │
│                                                     │
└────────────┬─────────────────────────┬──────────────┘
             │                         │
             │                         │
             ▼                         ▼
┌────────────────────────┐  ┌──────────────────────────┐
│ Main Backend           │  │ Members Backend          │
│ church-backend-norway  │  │ church-members-backend   │
│                        │  │                          │
│ - Site settings        │  │ - Member CRUD            │
│ - Calendar events      │  │ - SMS sending (Twilio)   │
│ - Live streaming       │  │ - SMS history            │
│ - Admin management     │  │ - JWT authentication     │
│                        │  │ - Audit logging          │
└────────────┬───────────┘  └──────────┬───────────────┘
             │                         │
             │                         │
             └──────────┬──────────────┘
                        ▼
         ┌──────────────────────────────┐
         │  PostgreSQL Database         │
         │  church_pgdatabase           │
         │  (Azure Database for         │
         │   PostgreSQL)                │
         └──────────────────────────────┘
```

## Security Notes

1. **Never commit .env files** - They are gitignored
2. **Rotate JWT_SECRET** regularly in production
3. **Change default admin password** immediately after deployment
4. **Use strong passwords** for all admin users
5. **Enable HTTPS only** (automatic on Azure App Service)
6. **Monitor Twilio usage** to avoid unexpected costs
7. **Regularly backup the database**

## Cost Optimization

1. Use same **App Service Plan** for all backends (shared resources)
2. Consider Azure PostgreSQL **Flexible Server** with auto-pause
3. Monitor Twilio SMS costs (~0.16 NOK per SMS in trial, varies when upgraded)
4. Use **Application Insights** sampling to reduce logging costs

## Next Steps

After successful deployment:

1. Change default admin password
2. Create additional admin users if needed
3. Import existing members data
4. Test SMS sending with a small group
5. Upgrade Twilio account to remove trial prefix
6. Enable alphanumeric sender ID "DEBREIYESUS"
7. Set up monitoring and alerts in Azure
