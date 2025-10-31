import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { GoogleAuthService } from '../services/googleAuth'

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithFacebook: () => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          // Verify token with server and get user info
          try {
            const response = await fetch('http://localhost:3001/api/auth/verify', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })
            if (response.ok) {
              const userData = await response.json()
              setUser(userData.user)
            } else {
              // Token is invalid, remove it
              localStorage.removeItem('token')
            }
          } catch (error) {
            // Token verification failed, remove it
            localStorage.removeItem('token')
          }
        }
        setLoading(false)
      } catch (error) {
        console.error('Auth check failed:', error)
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()
      setUser(data.user)
      localStorage.setItem('token', data.token)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    try {
      setLoading(true)
      const googleAuth = GoogleAuthService.getInstance()
      const { user, token } = await googleAuth.signIn()
      setUser(user)
      // Store JWT token in localStorage for persistence
      localStorage.setItem('token', token)
    } catch (error) {
      console.error('Google login failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const loginWithFacebook = async () => {
    try {
      setLoading(true)
      // TODO: Implement Facebook login
      throw new Error('Facebook login not yet implemented')
    } catch (error) {
      console.error('Facebook login failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      })

      if (!response.ok) {
        throw new Error('Registration failed')
      }

      const data = await response.json()
      setUser(data.user)
      localStorage.setItem('token', data.token)
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      const googleAuth = GoogleAuthService.getInstance()
      await googleAuth.signOut()
      localStorage.removeItem('token')
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    loginWithGoogle,
    loginWithFacebook,
    register,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
