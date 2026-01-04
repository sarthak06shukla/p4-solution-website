# ⚠️ ACTION REQUIRED: Add Cloudinary Credentials to .env

## Step 1: Open the .env file
Open this file: `C:\Users\sarth\OneDrive\Desktop\p4\backend\.env`

## Step 2: Add these 3 lines at the end

```
CLOUDINARY_CLOUD_NAME=dtevstubw
CLOUDINARY_API_KEY=249514244733799
CLOUDINARY_API_SECRET=Pq1IK5xQ2QQOqqzm4-k8oWcQ5bA
```

## Step 3: Save the file

Your complete .env file should now look like this:

```
PORT=5000
JWT_SECRET=your_jwt_secret_key_change_this_in_production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
EMAIL_USER=p4solution@gmail.com
EMAIL_PASSWORD=your_gmail_app_password_here
CLOUDINARY_CLOUD_NAME=dtevstubw
CLOUDINARY_API_KEY=249514244733799
CLOUDINARY_API_SECRET=Pq1IK5xQ2QQOqqzm4-k8oWcQ5bA
```

## What I've Done So Far:
✅ Installed Cloudinary package
✅ Installed streamifier package  
✅ Updated backend code to upload to Cloudinary
✅ Updated frontend to work with Cloudinary URLs

## What You Need to Do:
1. Add the 3 lines to .env as shown above
2. Save the file
3. Let me know when done - I'll restart the backend server

Once done, all new uploads will go to Cloudinary cloud storage instead of your computer!
