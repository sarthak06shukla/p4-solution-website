# P4 Solution - Company Website

Professional construction company website with portfolio management system.

## 🌟 Features

- Modern responsive design with glassmorphism UI
- Dynamic portfolio with project showcase
- Admin panel for content management  
- Image & video uploads (up to 100MB) via Cloudinary
- Contact form with email notifications
- 30+ years of experience showcase
- Mobile-first responsive design

## 🛠️ Technology Stack

**Frontend:**
- React 18
- React Router DOM
- Axios
- Vanilla CSS

**Backend:**
- Node.js
- Express.js
- PostgreSQL (Production) / SQLite (Development)
- JWT Authentication
- Multer + Cloudinary for file uploads
- Nodemailer for emails

**Cloud Services:**
- Cloudinary (Media Storage & CDN)
- Render (Hosting)

## 📁 Project Structure

```
p4/
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── admin/      # Admin panel components
│   │   ├── services/   # API service layer
│   │   └── utils/      # Helper functions
│   └── package.json
│
├── backend/            # Node.js backend API
│   ├── config/         # Database configuration
│   ├── routes/         # API routes
│   ├── migrations/     # Database migrations
│   └── package.json
│
└── README.md
```

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

Backend runs on: http://localhost:5000

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on: http://localhost:3000

## 📋 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
JWT_SECRET=your_jwt_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_TO=your_email@gmail.com
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 🌐 Deployment

See [DEPLOYMENT_COMMANDS.md](./DEPLOYMENT_COMMANDS.md) for step-by-step deployment instructions to Render.

Quick summary:
1. Push code to GitHub
2. Create PostgreSQL database on Render
3. Deploy backend web service
4. Deploy frontend static site
5. Configure environment variables

Full walkthrough available in the artifacts directory.

## 👥 Admin Panel

Access admin panel at: `/admin/login`

Default credentials (CHANGE IN PRODUCTION):
- Username: admin
- Password: admin123

Features:
- Add/Edit/Delete projects
- Upload images and videos
- Manage project details
- Category filtering

## 📧 Contact Form

Contact form sends emails using Gmail SMTP. Configure in backend `.env`:
- EMAIL_USER: Gmail address
- EMAIL_PASSWORD: Gmail app password (not your account password)
- EMAIL_TO: Destination inbox for contact form messages

## 🔐 Security

- JWT token-based authentication
- Password hashing for admin credentials
- CORS configuration for production
- Environment variables for sensitive data
- Cloudinary secure uploads

## 📱 Features

- Responsive design (mobile, tablet, desktop)
- Portfolio grid with category filters
- Video playback with fullscreen support
- Image lightbox gallery
- Contact form validation
- Admin authentication
- Cloud storage integration

## 🎨 Design

- Modern dark theme with gold accents
- Glassmorphism effects
- Smooth animations and transitions
- Professional typography (Inter, Outfit)
- Mobile-first responsive approach

## 📞 Support

For issues or questions, contact: p4solution@gmail.com

## 📄 License

Private - All rights reserved by P4 Solution

---

**Built with ❤️ for P4 Solution**
