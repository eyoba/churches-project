# Admin Credentials

## Super Admin Account
**Full system access - Can manage all churches**

- **Username**: `superadmin`
- **Password**: `superadmin123`
- **Email**: admin@churches.com
- **Login URL**: (Super Admin panel - separate from church admin)

---

## Church Admin Accounts
**Per-church access - Can only manage their own church**

### Default Password for All Church Admins: `admin123`

### Church 1: First Baptist Church
- **Username**: `admin.first`
- **Password**: `admin123`
- **Email**: admin@firstbaptist.no
- **Admin Name**: John Hansen

### Church 2: Grace Community Church
- **Username**: `admin.grace`
- **Password**: `admin123`
- **Email**: admin@gracechurch.no
- **Admin Name**: Sarah Olsen

### Church 3: Hope Fellowship Church
- **Username**: `admin.hope`
- **Password**: `admin123`

---

## Login URLs

- **Church Admin Login**: http://localhost:5178/admin/login
- **Frontend Website**: http://localhost:5178
- **Backend API**: http://localhost:5180/api

---

## Important Security Notes

⚠️ **WARNING**: These are default development passwords.

**For Production Deployment:**
1. Change ALL passwords immediately
2. Use strong, unique passwords for each account
3. Enable HTTPS/SSL
4. Consider implementing 2FA (Two-Factor Authentication)
5. Regularly rotate passwords
6. Remove this file before deploying to production

---

## Quick Start

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend:
   ```bash
   cd church-website
   npm run dev
   ```

3. Login at: http://localhost:5178/admin/login

4. Use any of the church admin credentials above to test the system
