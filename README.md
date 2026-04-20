<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/613b7140-4dd0-4e73-8b22-867cc58e3991

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deployment on Render.com

This project is configured for easy deployment on [Render](https://render.com).

### Steps to go live:

1. **Push to GitHub**: Ensure all your changes are pushed to your GitHub repository.
2. **Create a Web Service**:
   - Log in to Render.com and click **New > Web Service**.
   - Connect your GitHub repository.
3. **Configuration**:
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. **Environment Variables**:
   - Add `NODE_ENV`: `production`
   - Add `JWT_SECRET`: (Random long string for security)
5. **Database (SQLite)**:
   - *Note*: Render's free tier has an ephemeral file system. Any files uploaded or changes made to the database will be lost when the service restarts.
   - For persistent storage, you can attach a **Render Blueprint Disk** (requires a paid plan) or migrate to a cloud database like PostgreSQL.

### Initial Admin Login
- **Username**: `admin`
- **Password**: `admin123`
*(Please change this immediately in the Admin Dashboard!)*
