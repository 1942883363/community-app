import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { UserInfo } from '../types'
import { login as loginApi, getCurrentUser } from '../api/auth'
import { TOKEN_KEY } from '../api/request'

interface AuthState {
  token: string | null
  user: UserInfo | null
  isAuthenticated: boolean
  isValidating: boolean
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isValidating, setIsValidating] = useState(true)

  const isAuthenticated = !!token

  useEffect(() => {
    const stored = sessionStorage.getItem(TOKEN_KEY)
    if (!stored) {
      setIsValidating(false)
      return
    }
    getCurrentUser()
      .then((res) => {
        setUser(res.data)
      })
      .catch(() => {
        sessionStorage.removeItem(TOKEN_KEY)
        setToken(null)
      })
      .finally(() => {
        setIsValidating(false)
      })
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const response = await loginApi({ username, password })
    const newToken = response.data.access_token
    sessionStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
    try {
      const userResponse = await getCurrentUser()
      setUser(userResponse.data)
    } catch {
      setUser(null)
    }
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, isValidating, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
