# Church SMS Manager PWA

A Progressive Web App for church administrators to manage and send SMS messages to church members.

## Features

- Member management (add, edit, delete)
- Bulk SMS sending with member selection
- SMS scheduling (before 10:00 AM)
- SMS cost estimation ($0.0075 per SMS)
- SMS history and logs
- Installable as PWA (works offline)
- Mobile-first responsive design
- JWT authentication

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The app will run on http://localhost:5174

## Build for Production

```bash
npm run build
```

## Environment Variables

Create a `.env` file in the root directory:

```
VITE_API_URL=http://localhost:3001/api
```

## API Endpoints

The app connects to these backend endpoints:

- `POST /api/church-admin/login` - Admin login
- `GET /api/sms/members` - Get all members
- `POST /api/sms/members` - Add new member
- `PUT /api/sms/members/:id` - Update member
- `DELETE /api/sms/members/:id` - Delete member
- `POST /api/sms/send` - Send SMS
- `GET /api/sms/logs` - Get SMS history

## PWA Features

- Installable on mobile and desktop
- Offline support for viewing existing data
- Service worker for caching
- App manifest for native-like experience

## Technologies

- Vue 3
- Vue Router
- Axios
- Vite
- vite-plugin-pwa
- Tailwind-inspired CSS

## Converting SVG Icons to PNG

For better PWA support, convert the SVG icons to PNG:

```bash
# Using ImageMagick or online tools
convert icon-192.svg icon-192.png
convert icon-512.svg icon-512.png
```

Or use an online tool like https://cloudconvert.com/svg-to-png

## License

Private - Church Use Only
