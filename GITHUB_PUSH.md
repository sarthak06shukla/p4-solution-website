# GitHub Push - Quick Guide

## Step 1: Create GitHub Repository (YOU DO THIS)

1. Go to: **https://github.com/new**
2. Repository name: `p4-solution-website`
3. Visibility: **Private** 
4. Click "Create repository"

## Step 2: Get Your Repository URL

After creating, GitHub will show you a URL like:
```
https://github.com/YOUR_USERNAME/p4-solution-website.git
```

Copy this URL!

## Step 3: Push Your Code (RUN THESE COMMANDS)

Open PowerShell and run:

```powershell
cd C:\Users\sarth\OneDrive\Desktop\p4

# Replace YOUR_USERNAME with your actual GitHub username in the URL below
git remote add origin https://github.com/YOUR_USERNAME/p4-solution-website.git

# Push to GitHub
git push -u origin main
```

## Step 4: Verify

Refresh your GitHub repository page - you should see all your files!

---

## If Git Asks for Credentials:

GitHub now uses Personal Access Tokens:
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scope: `repo`
4. Copy the token
5. Use it as your password when Git asks

---

**That's it! Once pushed, come back and tell me - I'll help with Render deployment.**
