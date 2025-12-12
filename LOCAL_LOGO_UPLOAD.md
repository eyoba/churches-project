# Local Logo Upload Guide

## ✅ Upload Logo from Your Computer!

You can now upload your logo directly from your local folder - no need for external hosting services!

## 📤 How to Upload

### Step 1: Login to Super Admin
1. Go to: http://localhost:5178/super-admin/login
2. Login with:
   - Username: `superadmin`
   - Password: `superadmin123`

### Step 2: Upload Your Logo
1. In the "🎨 Site Logo" section, you'll see **two options**:

   **Option A: Upload from Computer** (Recommended!)
   - Click "Choose File" button
   - Browse to your downloaded Facebook logo
   - Select the image file
   - Click "📤 Upload Logo"
   - Done! Your logo is now uploaded and displayed everywhere

   **Option B: Enter Logo URL**
   - If you prefer using an external URL
   - Paste the URL in the text field
   - Click "Update from URL"

### Step 3: Verify
- Check the preview box - logo should appear immediately
- Visit http://localhost:5178 - see your logo on the home page!
- Login as church admin - see logo in the navigation!

## 📋 File Requirements

**Supported Formats:**
- PNG (recommended - supports transparency)
- JPG/JPEG
- GIF
- WebP
- SVG

**File Size:**
- Maximum: 5MB
- Recommended: Under 500KB for fast loading

**Dimensions:**
- Recommended: 500x500px or larger
- Square aspect ratio (1:1) works best
- Minimum: 200x200px

## 🎯 Where Your Logo Appears

Once uploaded, your logo automatically appears in:
1. **Home Page Header** - Large circular logo (150px)
2. **Admin Navigation Bar** - Small circular logo (40px)
3. **All Pages** - Consistent branding throughout

## 💾 Where Files Are Stored

Your uploaded logo is saved to:
```
/home/eyob/personal/debreiyesus/churches-project/backend/public/uploads/
```

And accessible via URL:
```
http://localhost:5180/uploads/logo-[timestamp].[ext]
```

## 🔄 Change Logo Anytime

To replace the logo:
1. Login to Super Admin dashboard
2. Click "Choose File" again
3. Select new logo
4. Click "Upload Logo"
5. Old logo remains in folder but new URL is used

## ✨ Features

✅ **Direct Upload** - No third-party services needed
✅ **Automatic Validation** - Only accepts image files under 5MB
✅ **Instant Preview** - See logo immediately after upload
✅ **Secure** - Only Super Admins can upload
✅ **File Type Check** - Validates image format
✅ **Size Limit** - Prevents huge files from slowing down site

## 🆘 Troubleshooting

**"Please select an image file" error:**
- Make sure you're selecting an image file (PNG, JPG, etc.)
- Not a document or other file type

**"File size must be less than 5MB" error:**
- Your image is too large
- Use an image editor to reduce file size
- Or compress it online at: https://tinypng.com

**Logo not showing after upload:**
- Refresh the page (Ctrl+F5 or Cmd+Shift+R)
- Clear browser cache
- Check browser console for errors

**Upload button disabled:**
- Make sure you've selected a file first
- Check that file is a valid image format

## 🎨 Best Practices

1. **Use PNG format** for logos with transparency
2. **Square images** (1:1 ratio) work best in circular containers
3. **High resolution** ensures clarity on retina displays
4. **Optimize file size** before uploading for faster load times
5. **Test on mobile** to ensure logo looks good on small screens

## 📝 Example Workflow

```
1. Download logo from Facebook → Save to Desktop
2. Login to Super Admin Dashboard
3. Click "Choose File" in Logo Upload section
4. Select logo from Desktop
5. Click "Upload Logo"
6. ✅ Done! Logo now appears everywhere
```

## 🔐 Security

- Only Super Admins can upload logos
- Files are validated before upload
- Stored in secure backend directory
- Church admins can see logo but cannot change it

---

**Enjoy your custom branding!** 🎉
