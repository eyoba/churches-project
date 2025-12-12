# Quick Start Guide - Get Running in 5 Minutes

This guide will help you get the entire system running quickly.

## Prerequisites Check

Make sure you have:
- [ ] Node.js installed (`node --version`)
- [ ] PostgreSQL installed and running
- [ ] 3 terminal windows ready

## Step 1: Database Setup (2 minutes)

```bash
# Connect to PostgreSQL
psql -U postgres

# Run the schema (from within psql)
\i /home/eyob/personal/debreiyesus/churches-project/backend/database.sql

# Verify it worked
\c churches_system
\dt

# Exit
\q
```

You should see 8 tables created.

## Step 2: Backend Setup (1 minute)

**Terminal 1:**
```bash
cd /home/eyob/personal/debreiyesus/churches-project/backend

# Install dependencies (first time only)
npm install

# Update .env file with your PostgreSQL credentials
nano .env
# Change: DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/churches_system

# Start server
npm start
```

Wait for: `✅ Running on port 3001`

## Step 3: Church Website Setup (1 minute)

**Terminal 2:**
```bash
cd /home/eyob/personal/debreiyesus/churches-project/church-website

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

Wait for: `Local: http://localhost:5173/`

## Step 4: SMS App Setup (1 minute)

**Terminal 3:**
```bash
cd /home/eyob/personal/debreiyesus/churches-project/sms-app

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

Wait for: `Local: http://localhost:5174/`

## Step 5: Test It Out

1. **Open Church Website:**
   - Go to: http://localhost:5173
   - You should see 3 churches

2. **Login to Admin:**
   - Go to: http://localhost:5173/admin/login
   - Username: `admin.first`
   - Password: `admin123`
   - Click around and try editing church info

3. **Open SMS App:**
   - Go to: http://localhost:5174
   - Login with same credentials
   - Try adding a member

## Default Test Accounts

| Username | Password | Church |
|----------|----------|--------|
| admin.first | admin123 | First Baptist Church Bergen |
| admin.grace | admin123 | Grace Community Church |
| admin.hope | admin123 | Hope Fellowship |

## Troubleshooting

### Backend won't start?
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Update DATABASE_URL in `backend/.env` with your PostgreSQL credentials

### Frontend shows errors?
- Make sure backend is running on port 3001
- Check browser console (F12) for errors

### Database doesn't exist?
- Run the database.sql file again
- Make sure you're connected to postgres first

## All Running Successfully?

You should have:
- ✅ Backend API running on http://localhost:3001
- ✅ Church Website on http://localhost:5173
- ✅ SMS App on http://localhost:5174
- ✅ 3 terminal windows with no errors

## What Can You Do Now?

**Church Website:**
- View all churches on homepage
- Click on a church to see details, news, events, photos
- Login as admin and manage your church

**Admin Dashboard:**
- Update church information
- Create/edit/delete news articles
- Manage events
- Upload photos (via URL)

**SMS App:**
- Add/edit/delete church members
- Compose SMS messages
- Select members and send SMS
- View SMS history

## Next Steps

1. Explore the admin dashboard
2. Try adding some news articles
3. Create some events
4. Add photos to the gallery
5. Add members in the SMS app
6. Set up Twilio for real SMS (optional)
7. Set up Cloudinary for image uploads (optional)

## Need Help?

See the full README.md for:
- Detailed setup instructions
- Twilio configuration
- Cloudinary configuration
- Common issues and solutions
- Production deployment guide

---

**Enjoy your new church management system!** 🎉
