# Set Up Your .env File - Step by Step (Right Now!)

Let's configure your `.env` file to get the system running ASAP.

## What You Need (Minimal Setup)

To run the system, you **MUST** configure:
1. ✅ Database connection (PostgreSQL)
2. ✅ JWT Secret (for authentication)

You **CAN SKIP** these for now (add later):
- ⏭️ SMS service (Twilio/Azure) - website will work, just can't send SMS
- ⏭️ Image hosting (Cloudinary/Azure) - can use direct URLs for images

---

## Step 1: Find Your PostgreSQL Credentials

Your PostgreSQL is already installed. Let's find the credentials:

### Method A: Check if you remember your postgres password
```bash
# Try connecting
psql -U postgres

# If it works, you're in! Your username is: postgres
# If it asks for password and you don't know it, go to Method B
```

### Method B: Check your system username
```bash
# Your current username
whoami

# Try connecting with your username
psql -U $(whoami) -d postgres
```

### Method C: Reset postgres password (if needed)
```bash
# Switch to postgres user
sudo -u postgres psql

# Inside psql, reset password:
ALTER USER postgres PASSWORD 'newpassword123';

# Exit
\q
```

---

## Step 2: Generate JWT Secret

Run this command to generate a secure random string:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output - you'll need it for the .env file.

---

## Step 3: Update Your .env File

Open the .env file:
```bash
cd /home/eyob/personal/debreiyesus/churches-project/backend
nano .env
```

**Edit these lines:**

```env
PORT=5180

# Update with YOUR PostgreSQL credentials
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/churches_system

# Paste the JWT secret you generated above
JWT_SECRET=paste_your_generated_secret_here

# Leave these as-is for now (you can set up later)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Keep these
WEBSITE_URL=http://localhost:5178
SMS_APP_URL=http://localhost:5179
NODE_ENV=development
```

### Example (replace with YOUR credentials):

```env
PORT=5180

# If your postgres username is 'postgres' and password is 'mypassword'
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/churches_system

# Your generated JWT secret
JWT_SECRET=8f3b2c1d9e7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c

TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

WEBSITE_URL=http://localhost:5178
SMS_APP_URL=http://localhost:5179
NODE_ENV=development
```

Save the file (Ctrl+X, then Y, then Enter if using nano).

---

## Step 4: Test Database Connection

Let's verify your database credentials work:

```bash
# Try connecting with the credentials you put in .env
psql "postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/churches_system"

# If it works, you'll see:
# churches_system=#

# Type \dt to see the tables
\dt

# Exit
\q
```

If you see 8 tables (churches, church_admins, etc.), you're good! ✅

If you get an error, your DATABASE_URL credentials are wrong. Update the .env file.

---

## Step 5: Verify .env File

Let's check your .env file is correct:

```bash
cd /home/eyob/personal/debreiyesus/churches-project/backend
cat .env
```

Make sure:
- ✅ DATABASE_URL has YOUR real username and password
- ✅ JWT_SECRET is a long random string (not the placeholder)
- ✅ PORT=5180
- ✅ WEBSITE_URL=http://localhost:5178
- ✅ SMS_APP_URL=http://localhost:5179

---

## What You Have Now

With just these 2 things configured, you can:
- ✅ Run the backend server
- ✅ Run the church website
- ✅ Run the SMS app
- ✅ Login as admin
- ✅ View churches
- ✅ Manage church info
- ✅ Create news and events
- ✅ Add members

**What won't work yet:**
- ❌ Sending SMS (need Twilio/Azure setup)
- ❌ Uploading images via Cloudinary (but you can use direct URLs)

---

## Ready to Run!

Now you can start the system:

**Terminal 1 - Backend:**
```bash
cd /home/eyob/personal/debreiyesus/churches-project/backend
npm install
npm start
```

**Terminal 2 - Church Website:**
```bash
cd /home/eyob/personal/debreiyesus/churches-project/church-website
npm install
npm run dev
```

**Terminal 3 - SMS App:**
```bash
cd /home/eyob/personal/debreiyesus/churches-project/sms-app
npm install
npm run dev
```

Then visit:
- **http://localhost:5178** (church website)
- **http://localhost:5179** (SMS app)

Login with:
- Username: `admin.first`
- Password: `admin123`

---

## Add SMS/Images Later

When you're ready to add SMS and image upload:

1. **For SMS:** See [AZURE_SETUP_GUIDE.md](./AZURE_SETUP_GUIDE.md) - Section 3
2. **For Images:** See [AZURE_SETUP_GUIDE.md](./AZURE_SETUP_GUIDE.md) - Section 4

Both have step-by-step Azure or free alternative (Twilio/Cloudinary) instructions.

---

## Need Help?

**Common Issues:**

1. **"password authentication failed"**
   - Your DATABASE_URL username or password is wrong
   - Check: `psql -U YOUR_USERNAME` works

2. **"database does not exist"**
   - Run the database.sql file first:
   ```bash
   psql -U postgres -f /home/eyob/personal/debreiyesus/churches-project/backend/database.sql
   ```

3. **"Cannot connect to database"**
   - Make sure PostgreSQL is running:
   ```bash
   sudo systemctl start postgresql
   sudo systemctl status postgresql
   ```

---

**You're all set! Your .env file is ready to go.** 🚀
