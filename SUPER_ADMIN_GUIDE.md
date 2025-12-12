# Super Admin Guide

## Overview
The Super Admin system allows you to manage all churches, church admins, and have full control over the entire platform.

## Super Admin Login Credentials

**URL:** http://localhost:5178/super-admin/login

**Username:** `superadmin`  
**Password:** `superadmin123`

⚠️ **IMPORTANT:** Change this password after first login!

## Super Admin Features

### 1. **Dashboard** (http://localhost:5178/super-admin/dashboard)
- View statistics for all churches
- Total churches, active churches, total members, total admins
- Complete list of all churches with details

### 2. **Add New Church**
- Click "➕ Add New Church" button
- Fill in church details:
  - Church Name (required)
  - Slug (required - URL-friendly name, e.g., "first-church")
  - Pastor Name and Title
  - Address, Phone, Email
  - Description
  - Service Times
  - Website URL
  - Active/Inactive status

### 3. **Edit Church**
- Click "Edit" button next to any church
- Modify all church information
- Update slug, contact details, pastor info, etc.

### 4. **Manage Church Admins**
- Click "Admins" button next to any church
- View all admins for that church
- Add new admin accounts:
  - Username (required)
  - Password (required)
  - Full Name (required)
  - Email (optional)
- Each church can have multiple admins

### 5. **Delete Church**
- Click "Delete" button next to any church
- Confirm deletion (this cannot be undone)
- ⚠️ Use with caution!

## Church Admin Access

Church admins can login at: http://localhost:5178/admin/login

Example existing church admin:
- **Username:** `admin.first`
- **Password:** `admin123`
- **Church:** First Church

## API Endpoints

All Super Admin endpoints require authentication with the super admin token.

### Authentication
```
POST /api/super-admin/login
Body: { "username": "superadmin", "password": "superadmin123" }
Returns: { "token": "...", "superAdmin": {...} }
```

### Church Management
```
GET    /api/super-admin/churches          - List all churches
GET    /api/super-admin/churches/:id      - Get church details
POST   /api/super-admin/churches          - Create new church
PUT    /api/super-admin/churches/:id      - Update church
DELETE /api/super-admin/churches/:id      - Delete church
```

### Admin Management
```
GET    /api/super-admin/churches/:id/admins     - List church admins
POST   /api/super-admin/churches/:id/admins     - Create church admin
```

## Database Table

The super admin data is stored in the `super_admins` table:
```sql
CREATE TABLE super_admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security Notes

1. **Change the default password** immediately after first login
2. Super admin has **full access** to all churches and data
3. Only share super admin credentials with trusted administrators
4. Use strong passwords for production
5. Consider implementing 2FA for production environments

## Common Tasks

### Add a New Church
1. Login as super admin
2. Go to dashboard
3. Click "➕ Add New Church"
4. Fill required fields (name, slug)
5. Set status to "Active"
6. Click "Save Church"

### Create Church Admin
1. Login as super admin
2. Go to dashboard
3. Find the church in the table
4. Click "Admins" button
5. Click "➕ Add Admin"
6. Fill in admin details
7. Click "Create Admin"
8. Share credentials with the church admin

### Activate/Deactivate Church
1. Login as super admin
2. Click "Edit" on the church
3. Toggle "Active" checkbox
4. Click "Save Church"

## Troubleshooting

**Can't login as super admin:**
- Check username is exactly `superadmin` (lowercase)
- Check password is exactly `superadmin123`
- Verify super_admins table exists in database

**Church not showing on public site:**
- Verify church is marked as "Active"
- Check slug is URL-friendly (no spaces or special chars)
- Refresh the page

**Church admin can't login:**
- Verify admin was created for correct church
- Check username is exactly as entered
- Verify admin is marked as "Active"

## Support

For issues or questions, check the main README.md or contact system administrator.
