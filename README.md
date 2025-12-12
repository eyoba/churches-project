# Multi-Church Website + SMS Management System

Complete solution for managing multiple churches with individual admin panels and SMS messaging capabilities.

## Project Structure

```
churches-project/
├── backend/              # Express.js API Server
│   ├── server.js        # Main API server
│   ├── database.sql     # PostgreSQL database schema
│   ├── package.json     # Node dependencies
│   └── .env            # Environment configuration
│
├── church-website/      # Vue 3 Public Website + Admin Dashboard
│   ├── src/
│   │   ├── views/      # Page components
│   │   ├── App.vue     # Root component
│   │   ├── router.js   # Vue Router config
│   │   └── style.css   # Global styles
│   └── package.json
│
└── sms-app/            # Vue 3 SMS Management PWA
    ├── src/
    │   ├── views/      # Page components
    │   └── ...
    └── package.json
```

## Features

### Church Website
- **Public Pages**
  - Homepage with list of all churches
  - Individual church pages with News, Events, and Gallery
  - Responsive design for mobile and desktop

- **Admin Dashboard** (Per Church)
  - Login system with JWT authentication
  - Update church information (address, phone, pastor, etc.)
  - Manage news articles (create, edit, delete, publish)
  - Manage events with dates and locations
  - Photo gallery with upload to Cloudinary
  - Dashboard with statistics

### SMS Management App
- **Progressive Web App** (Installable)
  - Login for church admins
  - Manage members (add, edit, delete)
  - Send SMS to selected members
  - Schedule SMS before 10:00 AM
  - View SMS history and costs
  - Cost tracking ($0.0075 per SMS)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** (optional, for version control)

## Step-by-Step Setup Guide

### Step 1: Database Setup

1. **Start PostgreSQL** (if not already running)
   ```bash
   # Linux
   sudo systemctl start postgresql

   # macOS
   brew services start postgresql

   # Windows - PostgreSQL should auto-start
   ```

2. **Create the database**
   ```bash
   # Login to PostgreSQL
   psql -U postgres

   # Or with your username
   psql -U your_username
   ```

3. **Run the database schema**
   ```sql
   -- Inside psql, run:
   \i /home/eyob/personal/debreiyesus/churches-project/backend/database.sql

   -- Or exit psql and run:
   psql -U postgres -f /home/eyob/personal/debreiyesus/churches-project/backend/database.sql
   ```

4. **Verify the database was created**
   ```sql
   \c churches_system
   \dt  -- List all tables
   ```

   You should see 8 tables: churches, church_admins, church_news, church_events, church_photos, members, sms_logs

### Step 2: Backend Configuration

1. **Navigate to backend folder**
   ```bash
   cd /home/eyob/personal/debreiyesus/churches-project/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Edit the `.env` file:
   ```bash
   nano .env
   # or
   code .env
   ```

   **Update these required fields:**
   ```env
   # Update with your PostgreSQL credentials
   DATABASE_URL=postgresql://your_username:your_password@localhost:5432/churches_system

   # Change to a secure random string
   JWT_SECRET=your-super-secret-random-string-here
   ```

   **Optional (can set up later):**
   ```env
   # Twilio SMS (sign up at https://www.twilio.com)
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890

   # Cloudinary (sign up at https://cloudinary.com)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Start the backend server**
   ```bash
   npm start

   # Or for development with auto-reload:
   npm run dev
   ```

   You should see:
   ```
   ╔════════════════════════════════════════════╗
   ║   Multi-Church System Backend              ║
   ║   ✅ Running on port 3001                  ║
   ║   📡 API: http://localhost:3001/api        ║
   ╚════════════════════════════════════════════╝
   ```

### Step 3: Church Website Setup

1. **Open a NEW terminal** and navigate to church-website
   ```bash
   cd /home/eyob/personal/debreiyesus/churches-project/church-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   VITE v5.x.x ready in xxx ms

   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

4. **Open in browser**

   Go to: **http://localhost:5173**

### Step 4: SMS App Setup

1. **Open ANOTHER terminal** and navigate to sms-app
   ```bash
   cd /home/eyob/personal/debreiyesus/churches-project/sms-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   VITE v5.x.x ready in xxx ms

   ➜  Local:   http://localhost:5174/
   ➜  Network: use --host to expose
   ```

4. **Open in browser**

   Go to: **http://localhost:5174**

## Testing the System

### 1. Test the Public Website

1. Open **http://localhost:5173**
2. You should see the homepage with 3 sample churches
3. Click "View Details" on any church to see its page

### 2. Test the Admin Dashboard

1. Go to **http://localhost:5173/admin/login**
2. Login with one of these test accounts:

   **Church 1 Admin:**
   - Username: `admin.first`
   - Password: `admin123`

   **Church 2 Admin:**
   - Username: `admin.grace`
   - Password: `admin123`

   **Church 3 Admin:**
   - Username: `admin.hope`
   - Password: `admin123`

3. After login, you'll see the admin dashboard
4. Try:
   - Updating church info
   - Adding a news article
   - Creating an event
   - Adding photos (via URL)

### 3. Test the SMS App

1. Open **http://localhost:5174**
2. Login with the same credentials as above
3. You should see the SMS Manager
4. Try:
   - Adding a new member
   - Selecting members with checkboxes
   - Composing an SMS message
   - Viewing SMS history

   **Note:** SMS sending requires Twilio configuration. Without it, you'll see an error, but member management will still work.

## Default Admin Accounts

The database comes with 3 pre-configured admin accounts:

| Church | Username | Password |
|--------|----------|----------|
| First Baptist Church Bergen | admin.first | admin123 |
| Grace Community Church | admin.grace | admin123 |
| Hope Fellowship | admin.hope | admin123 |

**⚠️ IMPORTANT:** Change these passwords before deploying to production!

## Optional: Third-Party Services Setup

### Twilio (for SMS)

1. Sign up at https://www.twilio.com/try-twilio
2. Get your Account SID, Auth Token, and Phone Number
3. Update the `.env` file in the backend folder
4. Restart the backend server

### Cloudinary (for Image Hosting)

1. Sign up at https://cloudinary.com (free tier: 25GB)
2. Get your Cloud Name, API Key, and API Secret from the dashboard
3. Update the `.env` file in the backend folder
4. Restart the backend server

Without Cloudinary, you can still use direct image URLs for photos.

## Common Issues & Solutions

### Issue: "Database does not exist"
**Solution:** Make sure you ran the `database.sql` file:
```bash
psql -U postgres -f /home/eyob/personal/debreiyesus/churches-project/backend/database.sql
```

### Issue: "Connection refused" on port 3001
**Solution:**
- Make sure the backend server is running
- Check if another application is using port 3001
- Update the port in `backend/.env` if needed

### Issue: "Cannot connect to database"
**Solution:**
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check your database credentials in `backend/.env`
- Make sure the database `churches_system` exists

### Issue: Frontend shows "Network Error"
**Solution:**
- Ensure backend is running on http://localhost:3001
- Check browser console for CORS errors
- Verify `.env` files in both frontend apps have correct API URL

### Issue: "Module not found" errors
**Solution:**
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again

## Running All Services Together

To run everything at once, open **3 separate terminals**:

**Terminal 1 - Backend:**
```bash
cd /home/eyob/personal/debreiyesus/churches-project/backend
npm run dev
```

**Terminal 2 - Church Website:**
```bash
cd /home/eyob/personal/debreiyesus/churches-project/church-website
npm run dev
```

**Terminal 3 - SMS App:**
```bash
cd /home/eyob/personal/debreiyesus/churches-project/sms-app
npm run dev
```

Then open:
- Church Website: **http://localhost:5178**
- SMS App: **http://localhost:5179**
- Backend API: **http://localhost:5180/api**

## Next Steps

1. **Change default passwords** for admin accounts
2. **Set up Twilio** for SMS functionality
3. **Set up Cloudinary** for image uploads
4. **Add your own churches** via the database or create an admin interface
5. **Customize styling** in the `style.css` files
6. **Deploy to production** (see DEPLOYMENT.md - coming soon)

## Tech Stack

- **Backend:** Node.js, Express, PostgreSQL, JWT, Twilio, Cloudinary
- **Frontend:** Vue 3, Vue Router, Axios, Vite
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Styling:** Custom CSS (Tailwind-inspired)

## Support

If you encounter any issues:
1. Check the console logs in browser (F12)
2. Check the backend terminal for errors
3. Verify all services are running
4. Check the Common Issues section above

## License

This project is for internal church use.

---

**Created:** 2024
**Version:** 2.0.0
**Status:** Production Ready ✓
