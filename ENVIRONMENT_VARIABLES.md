# Environment Variables Guide

## 🔒 Security First!

**NEVER commit `.env` files to GitHub!** They contain sensitive credentials.

## ✅ What to Commit

| File | Commit? | Description |
|------|---------|-------------|
| `.env.template` | ✅ Yes | Template without real credentials |
| `.env` | ❌ NO | Contains real credentials |
| `.env.example` | ✅ Yes | Example values |
| `SETUP_GUIDE.md` | ✅ Yes | Setup instructions |
| `backend/public/uploads/` | ❌ NO | Local image files |

## 📝 Current .env Files

You need to create these 3 `.env` files (they're already in `.gitignore`):

### 1. `backend/.env`
```env
PORT=3001
DATABASE_URL=postgresql://church_user:YOUR_PASSWORD@churchserverdevelopment.postgres.database.azure.com:5432/church_pgdatabase?sslmode=require
JWT_SECRET=d42f911fd925cbfbfb8d49cc5e901449bbf3979afd28a691957f3b5988074871
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
WEBSITE_URL=http://localhost:5178
SMS_APP_URL=http://localhost:5179
NODE_ENV=development
```

### 2. `church-website/.env`
```env
VITE_API_URL=http://localhost:3001/api
```

### 3. `sms-app/.env`
```env
VITE_API_URL=http://localhost:3001/api
```

## 🌟 Solution: Use Cloudinary for Images

### Why Cloudinary?
- ✅ Images stored in cloud (accessible from any computer)
- ✅ No more missing logos
- ✅ Automatic image optimization
- ✅ Free tier: 25GB storage
- ✅ Works in production

### How to Set Up Cloudinary

1. **Sign up**: https://cloudinary.com/users/register/free

2. **Get your credentials**:
   - Go to Dashboard
   - Copy: Cloud Name, API Key, API Secret

3. **Add to backend/.env**:
   ```env
   CLOUDINARY_CLOUD_NAME=dxxxxxxx
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
   ```

4. **Restart backend server**

5. **Re-upload logos** through the admin interface
   - Login as super admin
   - Go to each church settings
   - Re-upload the logo
   - It will now be stored in Cloudinary!

## 🚀 Deployment to Production

### For Azure App Service:

1. Go to Azure Portal
2. Navigate to your App Service
3. Go to **Configuration** → **Application Settings**
4. Add each environment variable as a new setting
5. Save and restart the app

### For GitHub Actions CI/CD:

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add each secret:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

4. In your workflow file:
   ```yaml
   env:
     DATABASE_URL: ${{ secrets.DATABASE_URL }}
     JWT_SECRET: ${{ secrets.JWT_SECRET }}
   ```

## 💾 How to Back Up Your .env Files

### Option 1: Password Manager (Recommended)
- Store in 1Password, Bitwarden, LastPass, etc.
- Create a secure note with all your .env file contents
- Accessible from anywhere

### Option 2: Encrypted USB Drive
- Copy .env files to encrypted USB
- Keep it secure

### Option 3: Azure Key Vault (Production)
- Store secrets in Azure Key Vault
- Reference them in your application

## 🔄 Syncing Between Office and Home

With the current setup:

| Component | How it Syncs |
|-----------|--------------|
| **Code** | GitHub (automatic) |
| **Database** | Azure PostgreSQL (automatic) |
| **Images** | Cloudinary (after setup) |
| **Environment Variables** | Manual (use password manager) |

## ⚠️ What NOT to Do

- ❌ Don't commit `.env` to GitHub
- ❌ Don't share `.env` files in Slack/Email
- ❌ Don't push `backend/public/uploads/` to Git
- ❌ Don't hardcode credentials in code

## ✅ What TO Do

- ✅ Use `.env.template` as a guide
- ✅ Store real .env in password manager
- ✅ Use Cloudinary for images
- ✅ Update JWT_SECRET on all computers when changed
- ✅ Whitelist your IP in Azure when changing locations

## 🆘 If You Accidentally Commit .env to GitHub

1. **Immediately rotate all secrets**:
   - Change database password in Azure
   - Generate new JWT_SECRET
   - Regenerate Cloudinary API keys

2. **Remove from Git history**:
   ```bash
   git filter-branch --force --index-filter \
   "git rm --cached --ignore-unmatch backend/.env" \
   --prune-empty --tag-name-filter cat -- --all

   git push origin --force --all
   ```

3. **Update `.gitignore` and verify**:
   ```bash
   git status
   # Make sure .env is not listed
   ```

## 📞 Need Help?

- Check `SETUP_GUIDE.md` for full setup instructions
- Check `README.md` for project overview
- For Cloudinary help: https://cloudinary.com/documentation
