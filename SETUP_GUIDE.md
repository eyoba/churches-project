# Setup Guide for New Computer

This guide will help you set up the project on a new computer without losing any data.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Git** configured with your GitHub account
3. Access to Azure PostgreSQL database

## Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/churches-project.git
cd churches-project
```

## Step 2: Set Up Environment Variables

### Backend

1. Copy the template:
   ```bash
   cd backend
   cp .env.template .env
   ```

2. Edit `.env` and fill in your values:
   - `DATABASE_URL`: Your Azure PostgreSQL connection string
   - `JWT_SECRET`: Use the same secret from your office (or generate new one)
   - `CLOUDINARY_*`: Your Cloudinary credentials (see Step 3)

### Frontend (Church Website)

```bash
cd church-website
echo VITE_API_URL=http://localhost:3001/api > .env
```

### Frontend (SMS App)

```bash
cd sms-app
echo VITE_API_URL=http://localhost:3001/api > .env
```

## Step 3: Configure Cloudinary (Important!)

**This solves the image problem permanently!**

1. Go to https://cloudinary.com
2. Sign up for a free account (25GB storage)
3. From the dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret
4. Add these to `backend/.env`

**Why Cloudinary?**
- Images stored in the cloud (accessible from anywhere)
- No more missing logos when switching computers
- Automatic image optimization
- Works in production without extra configuration

## Step 4: Add Your Home IP to Azure Firewall

1. Go to Azure Portal: https://portal.azure.com
2. Navigate to your PostgreSQL server: `churchserverdevelopment`
3. Click "Networking" in the left menu
4. Click "Add current client IP address"
5. Save

## Step 5: Install Dependencies and Run

```bash
# Install backend dependencies
cd backend
npm install
npm start

# In a new terminal - Install church-website dependencies
cd church-website
npm install
npm run dev

# In a new terminal - Install sms-app dependencies
cd sms-app
npm install
npm run dev
```

## Step 6: Access Your Applications

- **Church Website**: http://localhost:5178/
- **SMS App**: http://localhost:5179/
- **Super Admin**: http://localhost:5178/super-admin/login
- **Backend API**: http://localhost:3001/api

## Important Files (Never Commit to Git)

These files contain sensitive information and should NEVER be pushed to GitHub:

```
backend/.env
church-website/.env
sms-app/.env
backend/public/uploads/*
```

## Keeping .env Secure

### Option 1: Encrypted Backup (Recommended)
- Store your `.env` files in an encrypted password manager (1Password, Bitwarden, etc.)
- Or store them in an encrypted USB drive

### Option 2: Private Encrypted Repository
- Create a private GitHub repo just for `.env` files
- Use git-crypt to encrypt them

### Option 3: Azure Key Vault (Production)
- For production deployment, store secrets in Azure Key Vault
- Reference them in your CI/CD pipeline

## Production Deployment

When deploying to production:

1. Use environment variables in your hosting platform (Azure App Service, Heroku, etc.)
2. **DO NOT** deploy with `.env` files
3. Set environment variables in the platform's configuration:
   - Azure App Service: Configuration → Application Settings
   - Heroku: Settings → Config Vars
   - Vercel/Netlify: Environment Variables section

## Cloudinary Setup (Detailed)

1. **Sign up**: https://cloudinary.com/users/register/free
2. **Get credentials**: Dashboard → Account Details
3. **Add to .env**:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
   ```
4. **Restart backend server**
5. **Re-upload logos** through the admin interface
   - They'll now be stored in Cloudinary (accessible from anywhere!)

## Troubleshooting

### Images not showing?
- Make sure Cloudinary is configured
- Re-upload images through the admin interface

### Can't connect to database?
- Check if your IP is whitelisted in Azure firewall
- Verify DATABASE_URL in `.env`

### Login not working?
- Make sure JWT_SECRET is the same on all computers
- Or have everyone login again after changing JWT_SECRET

## Next Steps After Setup

1. ✅ Configure Cloudinary
2. ✅ Re-upload all church logos through admin interface
3. ✅ Test super admin login
4. ✅ Test church admin logins
5. ✅ Verify all images are loading

## Data Synchronization

Your data is automatically synchronized because:
- **Database**: Hosted on Azure (accessible from anywhere)
- **Images** (after Cloudinary): Stored in cloud (accessible from anywhere)
- **Code**: Synced via GitHub

You can work from home, office, or any computer without data loss!
