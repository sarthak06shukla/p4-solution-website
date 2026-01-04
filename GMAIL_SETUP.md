# Gmail Setup for Contact Form Emails

## ⚠️ IMPORTANT: You Need to Configure Gmail

The contact form is now set up to send emails to **p4solution@gmail.com**, but you need to configure Gmail credentials first.

## Steps to Set Up Gmail App Password:

### 1. Enable 2-Factor Authentication on Gmail
1. Go to your Google Account: https://myaccount.google.com
2. Click on **Security** (left sidebar)
3. Under "Signing in to Google," click on **2-Step Verification**
4. Follow the steps to enable 2-Factor Authentication

### 2. Create App Password
1. After enabling 2-Step Verification, go back to **Security**
2. Under "Signing in to Google," click on **App passwords**
3. You might need to sign in again
4. In the "Select app" dropdown, choose **Mail**
5. In the "Select device" dropdown, choose **Other (Custom name)**
6. Type: "P4 Solution Website"
7. Click **Generate**
8. **COPY THE 16-CHARACTER PASSWORD** that appears (it will look like: `abcd efgh ijkl mnop`)

### 3. Update the .env File
1. Open the file: `C:\Users\sarth\OneDrive\Desktop\p4\backend\.env`
2. Find this line: `EMAIL_PASSWORD=your_gmail_app_password_here`
3. Replace `your_gmail_app_password_here` with the 16-character password you copied
4. **Remove all spaces** from the password
5. Save the file

Example:
```
EMAIL_USER=p4solution@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
```

### 4. Restart the Backend Server
After updating the .env file, you need to restart the backend:
- Stop the current backend server (Ctrl+C if running in terminal)
- Start it again: `npm start` (in the backend directory)

## How It Works

When someone fills out the contact form on your website:
1. The form data is sent to your backend API
2. The backend uses **nodemailer** to send an email
3. The email is sent FROM: p4solution@gmail.com TO: p4solution@gmail.com
4. The email contains all the form details (name, email, phone, message)
5. You can reply directly to the customer using the "Reply" button

## Testing

Once configured, you can test by:
1. Going to http://localhost:3000/contact
2. Filling out the contact form
3. Submitting it
4. Check your Gmail inbox for the message

## Troubleshooting

**If emails aren't sending:**
- Make sure 2-Factor Authentication is enabled
- Verify the App Password is correct (no spaces)
- Check that EMAIL_USER is `p4solution@gmail.com`
- Restart the backend server after changing .env
- Check backend console for error messages

## Security Note

- Never share your App Password
- The .env file is already in .gitignore (won't be uploaded to GitHub)
- For production, consider using dedicated email services like SendGrid or AWS SES
