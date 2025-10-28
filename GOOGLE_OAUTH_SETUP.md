# Google OAuth Setup Guide

## Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** (or select existing)
3. **Enable Google Identity API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Identity"
   - Enable "Google Identity" API
4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Name: "FB Group Ads Manager"

## Step 2: Configure OAuth Client

### Authorized JavaScript origins:
```
http://localhost:5173
http://localhost:3000
```

### Authorized redirect URIs:
```
http://localhost:5173
http://localhost:3000
```

## Step 3: Get Your Credentials

After creating the OAuth client, you'll get:
- **Client ID**: `your-client-id.googleusercontent.com`
- **Client Secret**: `your-client-secret`

## Step 4: Update Environment Variables

Create a `.env` file in your project root with:

```env
# MongoDB Configuration
VITE_MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
VITE_MONGODB_DB=fb-group-ads-manager

# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend Google OAuth (for client-side)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com
```

## Step 5: Test the Integration

1. **Start your servers**:
   ```bash
   npm run dev  # Frontend on http://localhost:5173
   node server.js  # Backend on http://localhost:3001
   ```

2. **Visit your app**: http://localhost:5173
3. **Click "Continue with Google"**
4. **Complete Google OAuth flow**
5. **You should be logged in!**

## Troubleshooting

### Common Issues:
- **"Invalid client"**: Check your Client ID
- **"Redirect URI mismatch"**: Add your domain to authorized redirect URIs
- **"Access blocked"**: Enable Google Identity API
- **CORS errors**: Make sure your backend allows your frontend domain

### Production Setup:
- Add your production domain to authorized origins
- Use environment variables for all secrets
- Enable HTTPS in production
- Set up proper CORS configuration
