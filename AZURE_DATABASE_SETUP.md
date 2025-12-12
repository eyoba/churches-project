# Azure PostgreSQL Database Setup

You have an Azure PostgreSQL database! Here's how to configure it.

## Your Azure Database Info

- **Endpoint:** churchserverdevelopment.postgres.database.azure.com ✅
- **Database Name:** church_pgdatabase ✅
- **Username:** ❓ (You need to find this)
- **Password:** ❓ (You need to remember/reset this)

---

## Step 1: Find Your Username

Your username is what you set when you created the database. Common formats:

- `yourusername` (simple username)
- `adminuser` (if you used a generic name)
- `eyob` (your name)
- `churchadmin` (if you used a descriptive name)

### How to Check in Azure Portal:

1. Go to: https://portal.azure.com
2. Search for: **churchserverdevelopment**
3. Click on your PostgreSQL server
4. Look at **"Overview"** page
5. Find **"Server admin login name"** - that's your username!

### How to Check with Azure CLI:

```bash
# List all your PostgreSQL servers
az postgres flexible-server list --output table

# Get specific server details
az postgres flexible-server show \
  --name churchserverdevelopment \
  --query "{Name:name, AdminUser:administratorLogin}" \
  --output table
```

---

## Step 2: Get/Reset Your Password

### If You Remember Your Password:
- Great! Use it in Step 4 below.

### If You Forgot Your Password:

**Reset it via Azure Portal:**
1. Go to: https://portal.azure.com
2. Find your server: **churchserverdevelopment**
3. Click **"Reset password"** in the left menu
4. Enter a new password (must be 8+ characters)
5. Click **Save**

**Reset it via Azure CLI:**
```bash
az postgres flexible-server update \
  --name churchserverdevelopment \
  --resource-group YOUR_RESOURCE_GROUP \
  --admin-password "YourNewSecurePassword123!"
```

---

## Step 3: Allow Your IP Address

Your local computer needs permission to connect to the Azure database.

### Get Your Public IP:
```bash
curl ifconfig.me
```

### Add Firewall Rule (Azure Portal):
1. Go to your PostgreSQL server in Azure Portal
2. Click **"Networking"** in the left menu
3. Under **"Firewall rules"**, click **"+ Add current client IP address"**
4. Click **"Save"**

### Add Firewall Rule (Azure CLI):
```bash
# Get your IP
MY_IP=$(curl -s ifconfig.me)

# Add firewall rule
az postgres flexible-server firewall-rule create \
  --resource-group YOUR_RESOURCE_GROUP \
  --name churchserverdevelopment \
  --rule-name allow-my-computer \
  --start-ip-address $MY_IP \
  --end-ip-address $MY_IP
```

**Note:** If you're on a dynamic IP, you might need to update this when your IP changes.

---

## Step 4: Update Your .env File

Open your .env file:
```bash
nano /home/eyob/personal/debreiyesus/churches-project/backend/.env
```

Update the DATABASE_URL line:

```env
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@churchserverdevelopment.postgres.database.azure.com:5432/church_pgdatabase?sslmode=require
```

**Example:**
If your username is `churchadmin` and password is `MySecurePass123!`:

```env
DATABASE_URL=postgresql://churchadmin:MySecurePass123!@churchserverdevelopment.postgres.database.azure.com:5432/church_pgdatabase?sslmode=require
```

**Important Notes:**
- ⚠️ Include `?sslmode=require` at the end (Azure requires SSL)
- ⚠️ If your password has special characters, you might need to URL-encode them:
  - `@` becomes `%40`
  - `#` becomes `%23`
  - `!` usually works as-is, but if issues, use `%21`

---

## Step 5: Test the Connection

Try connecting from your computer:

```bash
# Replace with your actual username
psql "postgresql://YOUR_USERNAME@churchserverdevelopment.postgres.database.azure.com:5432/church_pgdatabase?sslmode=require"

# It will prompt for password
# Type your password and press Enter
```

If successful, you'll see:
```
church_pgdatabase=>
```

Type `\l` to list databases, then `\q` to quit.

---

## Step 6: Create Database Tables

Now that you're connected, create the tables:

### Method A: From psql
```bash
# Connect to your Azure database
psql "postgresql://YOUR_USERNAME:YOUR_PASSWORD@churchserverdevelopment.postgres.database.azure.com:5432/church_pgdatabase?sslmode=require"

# Inside psql, run:
\i /home/eyob/personal/debreiyesus/churches-project/backend/database.sql

# Verify tables were created:
\dt

# You should see 8 tables:
# - churches
# - church_admins
# - church_news
# - church_events
# - church_photos
# - members
# - sms_logs

# Exit:
\q
```

### Method B: Direct command
```bash
psql "postgresql://YOUR_USERNAME:YOUR_PASSWORD@churchserverdevelopment.postgres.database.azure.com:5432/church_pgdatabase?sslmode=require" \
  -f /home/eyob/personal/debreiyesus/churches-project/backend/database.sql
```

---

## Step 7: Generate JWT Secret

While you're here, let's also set up your JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and add it to your .env file:

```env
JWT_SECRET=paste_the_generated_string_here
```

---

## Complete .env Example

Your `.env` file should look like this:

```env
PORT=5180

# Azure PostgreSQL Database
DATABASE_URL=postgresql://churchadmin:MySecurePass123!@churchserverdevelopment.postgres.database.azure.com:5432/church_pgdatabase?sslmode=require

# JWT Secret
JWT_SECRET=8f3b2c1d9e7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c

# Twilio SMS (Optional - set up later)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Cloudinary Images (Optional - set up later)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS
WEBSITE_URL=http://localhost:5178
SMS_APP_URL=http://localhost:5179

# Environment
NODE_ENV=development
```

---

## Troubleshooting

### Error: "password authentication failed"
- Double-check your username and password
- Make sure you're using the correct format
- Reset password in Azure Portal if needed

### Error: "could not connect to server"
- Check your firewall rules in Azure Portal
- Make sure your IP address is allowed
- Verify the endpoint is correct

### Error: "SSL connection required"
- Make sure you have `?sslmode=require` at the end of the DATABASE_URL

### Error: "database does not exist"
- The database name should be `church_pgdatabase` (what you created)
- If you created it with a different name, update the DATABASE_URL

---

## Quick Reference

**Connection String Format:**
```
postgresql://USERNAME:PASSWORD@churchserverdevelopment.postgres.database.azure.com:5432/church_pgdatabase?sslmode=require
```

**Find Username:**
- Azure Portal → PostgreSQL server → Overview → "Server admin login name"

**Reset Password:**
- Azure Portal → PostgreSQL server → Reset password

**Add Your IP:**
- Azure Portal → PostgreSQL server → Networking → Add current client IP

---

## Next Steps

Once your database is configured:

1. ✅ Update DATABASE_URL in .env
2. ✅ Generate and add JWT_SECRET
3. ✅ Run database.sql to create tables
4. ▶️ Start the backend server: `npm start`
5. ▶️ Start the frontend apps: `npm run dev`

---

**Need help finding your credentials?** Let me know and I can guide you through the Azure Portal!
