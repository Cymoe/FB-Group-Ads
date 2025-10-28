// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id'
export const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || 'your-google-client-secret'

// Google OAuth Scopes
export const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile'
]

// Google OAuth Configuration Object
export const googleAuthConfig = {
  clientId: GOOGLE_CLIENT_ID,
  scopes: GOOGLE_SCOPES,
  redirectUri: window.location.origin,
  responseType: 'code'
}
