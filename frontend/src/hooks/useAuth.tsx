'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import Cookies from 'js-cookie'
import { authApi, usersApi } from '@/lib/api'

interface User {
  id: string
  email: string
  full_name: string
  target_role?: string
  target_industry?: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, full_name: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = Cookies.get('access_token')
    if (token) {
      usersApi.getMe()
        .then(({ data }) => setUser(data))
        .catch(() => logout())
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password })
    Cookies.set('access_token', data.access_token, { expires: 1 })
    Cookies.set('refresh_token', data.refresh_token, { expires: 30 })
    const { data: userData } = await usersApi.getMe()
    setUser(userData)
  }

  const register = async (email: string, full_name: string, password: string) => {
    await authApi.register({ email, full_name, password })
    await login(email, password)
  }

  const logout = () => {
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
    setUser(null)
    window.location.href = '/auth/login'
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
