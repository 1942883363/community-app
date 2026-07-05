import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { UserInfo } from '../types'
import { login as loginApi, getCurrentUser } from '../api/auth'
import { TOKEN_KEY } from '../api/request'

interface AuthState {
  token: string | null
  user: UserInfo | null
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<UserInfo | null>(null)

  const isAuthenticated = !!token

  const login = useCallback(async (username: string, password: string) => {
    const response = await loginApi({ username, password })
    const newToken = response.data.access_token
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
    try {
      const userResponse = await getCurrentUser()
      setUser(userResponse.data)
    } catch {
      setUser(null)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, login, logout }}>
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
