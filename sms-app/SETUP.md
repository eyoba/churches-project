# SMS App Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   cd /home/eyob/personal/debreiyesus/churches-project/sms-app
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   App will be available at: http://localhost:5174

3. **Build for Production**
   ```bash
   npm run build
   ```

## Important Notes

### PWA Icons
The app includes SVG placeholder icons. For production, convert them to PNG:

```bash
cd public
# Use ImageMagick, or online converter
convert icon-192.svg icon-192.png
convert icon-512.svg icon-512.png
```

Then update `vite.config.js` and `public/manifest.json` to reference `.png` files instead of `.svg`.

### Backend Requirements

The backend API must implement these endpoints:

#### Authentication
- **POST** `/api/church-admin/login`
  - Body: `{ email: string, password: string }`
  - Response: `{ token: string, churchId: number, name: string }`

#### SMS Members
- **GET** `/api/sms/members`
  - Headers: `Authorization: Bearer <token>`
  - Response: `Array<{ id: number, name: string, phone: string }>`

- **POST** `/api/sms/members`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ name: string, phone: string }`
  - Response: `{ id: number, name: string, phone: string }`

- **PUT** `/api/sms/members/:id`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ name: string, phone: string }`
  - Response: `{ id: number, name: string, phone: string }`

- **DELETE** `/api/sms/members/:id`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ message: string }`

#### SMS Operations
- **POST** `/api/sms/send`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ message: string, memberIds: number[], scheduleForMorning: boolean }`
  - Response: `{ message: string, sent: number }`

- **GET** `/api/sms/logs`
  - Headers: `Authorization: Bearer <token>`
  - Response: `Array<{ id: number, message: string, recipients_count: number, status: string, created_at: string }>`

### Environment Configuration

Edit `.env` to point to your backend API:

```env
VITE_API_URL=http://localhost:3001/api
```

For production:
```env
VITE_API_URL=https://your-domain.com/api
```

### Testing the App

1. Ensure backend API is running on port 3001
2. Start the SMS app: `npm run dev`
3. Navigate to http://localhost:5174
4. Login with admin credentials
5. Test features:
   - Add members
   - Select members
   - Compose and send SMS
   - View SMS history

### Installing as PWA

On mobile devices:
1. Open the app in a browser
2. Look for "Install" prompt or "Add to Home Screen"
3. Follow the prompts

On desktop (Chrome):
1. Open the app
2. Click the install icon in the address bar
3. Follow the prompts

### File Structure

```
sms-app/
├── public/
│   ├── icon-192.svg        # App icon (192x192)
│   ├── icon-512.svg        # App icon (512x512)
│   └── manifest.json       # PWA manifest
├── src/
│   ├── views/
│   │   ├── Login.vue       # Login page
│   │   └── SMSManager.vue  # Main SMS management interface
│   ├── App.vue             # Root component
│   ├── main.js             # App initialization
│   ├── router.js           # Vue Router configuration
│   └── style.css           # Global styles
├── .env                    # Environment variables
├── .gitignore             # Git ignore rules
├── index.html             # HTML entry point
├── package.json           # Dependencies
├── vite.config.js         # Vite configuration
├── README.md              # Project documentation
└── SETUP.md               # This file
```

### Troubleshooting

**Issue: API calls failing**
- Check that backend is running
- Verify VITE_API_URL in .env
- Check browser console for errors
- Verify JWT token is being sent

**Issue: PWA not installing**
- Ensure using HTTPS (required for PWA)
- Check that manifest.json is accessible
- Verify icons exist and are correct size
- Check browser console for PWA errors

**Issue: Login not working**
- Verify backend login endpoint
- Check credentials
- Look at network tab for error response
- Verify JWT token is being saved to localStorage

### Production Deployment

1. Build the app:
   ```bash
   npm run build
   ```

2. The `dist/` folder contains the production build

3. Deploy to static hosting:
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - Any static file server

4. Ensure HTTPS is enabled (required for PWA features)

5. Update `.env` or build with production API URL:
   ```bash
   VITE_API_URL=https://api.your-domain.com npm run build
   ```

### Security Notes

- Always use HTTPS in production
- JWT tokens are stored in localStorage
- Implement token refresh if needed
- Add rate limiting on backend
- Validate all user inputs on backend
- Use environment variables for sensitive config

