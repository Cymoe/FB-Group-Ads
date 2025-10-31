import { googleAuthConfig } from '../config/googleAuth'

interface GoogleUser {
  id: string
  email: string
  name: string
  picture?: string
}

interface AuthResult {
  user: GoogleUser
  token: string
}

export class GoogleAuthService {
  private static instance: GoogleAuthService
  private isInitialized = false

  static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService()
    }
    return GoogleAuthService.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    // Load Google OAuth script
    return new Promise((resolve, reject) => {
      if (window.google) {
        this.isInitialized = true
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        this.isInitialized = true
        resolve()
      }
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  async signIn(): Promise<AuthResult> {
    await this.initialize()

    return new Promise((resolve, reject) => {
      if (!window.google) {
        reject(new Error('Google OAuth not loaded'))
        return
      }

      window.google.accounts.oauth2.initCodeClient({
        client_id: googleAuthConfig.clientId,
        scope: googleAuthConfig.scopes.join(' '),
        redirect_uri: window.location.origin,
        callback: (response: any) => {
          if (response.code) {
            // Exchange code for token
            this.exchangeCodeForToken(response.code)
              .then(resolve)
              .catch(reject)
          } else {
            reject(new Error('No authorization code received'))
          }
        }
      }).requestCode()
    })
  }

  private async exchangeCodeForToken(code: string): Promise<AuthResult> {
    try {
      // Send code to your backend to exchange for token
      const response = await fetch('http://localhost:3001/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        throw new Error('Failed to exchange code for token')
      }

      const data = await response.json()
      return { user: data.user, token: data.token }
    } catch (error) {
      console.error('Token exchange failed:', error)
      throw error
    }
  }

  async signOut(): Promise<void> {
    if (window.google && window.google.accounts) {
      window.google.accounts.oauth2.revoke()
    }
  }
}

// Extend Window interface for Google OAuth
declare global {
  interface Window {
    google: any
  }
}
