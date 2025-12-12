# Logo Upload Guide

## ✅ Logo Management System Created!

Your multi-church system now has a complete logo management system where you can upload and display your church logo across all pages.

## 🎯 How to Upload Your Logo

### Step 1: Upload Your Logo Image

Since you've downloaded the logo from Facebook, you need to upload it to an image hosting service. Here are your options:

#### Option A: Use Imgur (Free & Easy)
1. Go to https://imgur.com
2. Click "New post" (no account needed)
3. Upload your logo file
4. Right-click on the uploaded image → "Copy image address"
5. You'll get a URL like: `https://i.imgur.com/XXXXX.png`

#### Option B: Use Cloudinary (Free & Professional)
1. Go to https://cloudinary.com and create a free account
2. Upload your image to Media Library
3. Click on the image and copy the "Secure URL"

#### Option C: Use Your Own Hosting
If you have web hosting, you can upload the image there and use that URL.

### Step 2: Add Logo via Super Admin Dashboard

1. **Login as Super Admin**
   - Go to: http://localhost:5178/super-admin/login
   - Username: `superadmin`
   - Password: `superadmin123`

2. **Navigate to Logo Section**
   - You'll see "🎨 Site Logo" section at the top of the dashboard
   - It shows a preview area on the left
   - Input field on the right

3. **Enter Your Logo URL**
   - Paste the image URL you copied (from Imgur, Cloudinary, etc.)
   - Click "Update Logo" button

4. **Verify Logo Appears**
   - The logo preview should update immediately
   - Go to http://localhost:5178 (home page) to see it in action

## 📍 Where the Logo Appears

Once uploaded, your logo will automatically appear in:

✅ **Home Page** - Large circular logo in the header
✅ **Church Admin Navigation** - Small circular logo next to "Church Admin"
✅ **Super Admin Dashboard** - In the logo management section

## 🎨 Logo Specifications

For best results:
- **Format**: PNG with transparent background (recommended)
- **Size**: 500x500px or larger (square aspect ratio works best)
- **File Size**: Under 1MB for fast loading

## 🔄 Change Logo Anytime

To change the logo:
1. Login to Super Admin dashboard
2. Upload new image to hosting service
3. Paste new URL in the logo input field
4. Click "Update Logo"
5. Refresh your browser to see changes

## 🌐 Current Display

**Home Page:**
- Logo appears in a white circular container
- 150px max size
- Centered above the site title

**Admin Navigation:**
- Logo appears as 40px circle
- Next to "Church Admin" text
- White background with padding

## 💡 Tips

1. **Use PNG format** for transparent backgrounds
2. **Square images** work best (1:1 aspect ratio)
3. **High resolution** ensures clarity on all devices
4. **Test on mobile** - logo is responsive

## 🆘 Troubleshooting

**Logo not showing?**
- Check if the URL is accessible (open in new tab)
- Make sure URL starts with `http://` or `https://`
- Try a different image hosting service
- Clear browser cache (Ctrl+Shift+R)

**Logo too small/large?**
- The system automatically resizes images
- Use square images for best results

**Logo looks pixelated?**
- Upload a higher resolution image
- Minimum recommended: 500x500px

## 📝 Example URLs

Valid logo URL formats:
```
https://i.imgur.com/abc123.png
https://res.cloudinary.com/your-name/image/upload/v123/logo.png
https://example.com/images/church-logo.png
```

## 🔐 Security Note

Only Super Admins can change the site logo. Church admins cannot modify it.

---

**Need Help?**
Check the SUPER_ADMIN_GUIDE.md for more super admin features!
