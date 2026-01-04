# Quick Commands Reference for Render Deployment

## Git Setup & Push

```bash
# Navigate to project
cd C:\Users\sarth\OneDrive\Desktop\p4

# Initialize Git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Prepare P4 Solution for Render deployment"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/p4-solution-website.git

# Push to GitHub
git push -u origin main
```

## Environment Variables for Render Backend

Copy these to Render Dashboard → Backend Service → Environment:

```
NODE_ENV=production
DATABASE_URL=<from-render-postgresql-dashboard>
FRONTEND_URL=https://p4-solution-frontend.onrender.com
JWT_SECRET=<generate-random-32-char-string>
ADMIN_USERNAME=<choose-username>
ADMIN_PASSWORD=<choose-strong-password>
EMAIL_USER=p4solution@gmail.com
EMAIL_PASSWORD=<gmail-app-password>
CLOUDINARY_CLOUD_NAME=dtevstubw
CLOUDINARY_API_KEY=249514244733799
CLOUDINARY_API_SECRET=Pq1IK5xQ2QQOqqzm4-k8oWcQ5bA
```

## Environment Variables for Render Frontend

Copy to Render Dashboard → Frontend Service → Environment:

```
REACT_APP_API_URL=https://p4-solution-backend.onrender.com/api
```

## Database Migration Command

Run in Render Backend Shell:

```bash
cd backend
cat migrations/init.sql | psql $DATABASE_URL
```

## Generate JWT Secret

Use this online or in terminal:

**Online**: https://randomkeygen.com/ (CodeIgniter Encryption Keys)

**Or PowerShell**:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

## Render Service Settings

### Backend Web Service
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free

### Frontend Static Site
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`
- **Plan**: Free (Static)

### PostgreSQL Database
- **Name**: `p4-solution-db`
- **Database**: `p4solution`
- **Region**: Singapore
- **Plan**: Free

## Troubleshooting

### If Backend Won't Start
1. Check environment variables are set correctly
2. Check DATABASE_URL is from PostgreSQL internal URL
3. View logs in Render dashboard

### If Frontend Can't Connect to Backend
1. Check REACT_APP_API_URL is correct backend URL + `/api`
2. Check backend FRONTEND_URL matches frontend URL
3. Redeploy frontend after fixing

### If Database Migration Fails
1. Ensure PostgreSQL database is running
2. Copy DATABASE_URL exactly from Render dashboard
3. Run migration command in backend shell

## Post-Deployment

Test your live website:
- Homepage: https://p4-solution-frontend.onrender.com
- Admin: https://p4-solution-frontend.onrender.com/admin/login
- API: https://p4-solution-backend.onrender.com/api/health
