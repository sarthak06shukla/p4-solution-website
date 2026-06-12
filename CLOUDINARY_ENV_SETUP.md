# Cloudinary Setup

Add your Cloudinary credentials to the backend environment.

## Local Development

Open `backend/.env` and add:

```env
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Render Deployment

Add the same three variables in Render Dashboard -> Backend Service -> Environment.

If any Cloudinary credentials were ever committed to GitHub, rotate the API secret in Cloudinary and update Render with the new value.

## Notes

- New project uploads are stored in the `p4-solution-projects` Cloudinary folder.
- The public projects API can temporarily show the saved fallback project list from `backend/data/projects.fallback.json` if PostgreSQL is unavailable.
