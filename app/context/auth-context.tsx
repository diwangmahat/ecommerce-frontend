"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; token: string } }
  | { type: "LOGOUT" }
  | { type: "SET_USER"; payload: User }

const AuthContext = createContext<{
  state: AuthState
  dispatch: React.Dispatch<AuthAction>
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  register: (userData: { name: string; email: string; password: string }) => Promise<{
    success: boolean
    message?: string
  }>
  logout: () => void
  updateProfile: (userData: { name?: string; email?: string; password?: string }) => Promise<{
    success: boolean
    message?: string
  }>
} | null>(null)

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      }
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      }
    case "LOGOUT":
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      }
    default:
      return state
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem("token")
    if (token) {
      verifyToken(token)
    } else {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [])

  const verifyToken = async (token: string) => {
    try {
      const response =await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            user: userData,
            token,
          },
        })
      } else {
        localStorage.removeItem("token")
        localStorage.removeItem("adminToken")
        dispatch({ type: "LOGOUT" })
      }
    } catch (error) {
      console.error("Token verification failed:", error)
      localStorage.removeItem("token")
      localStorage.removeItem("adminToken")
      dispatch({ type: "LOGOUT" })
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store the token
        localStorage.setItem("token", data.token)

        // If user is admin, also store admin token
        if (data.role === "admin") {
          localStorage.setItem("adminToken", data.token)
        }

        const user = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
        }

        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            user,
            token: data.token,
          },
        })
        return { success: true }
      } else {
        dispatch({ type: "SET_LOADING", payload: false })
        return { success: false, message: data.message || "Invalid email or password" }
      }
    } catch (error) {
      console.error("Login error:", error)
      dispatch({ type: "SET_LOADING", payload: false })
      return { success: false, message: "Network error. Please try again." }
    }
  }

  const register = async (userData: { name: string; email: string; password: string }): Promise<{
    success: boolean
    message?: string
  }> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("token", data.token)

        const user = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
        }

        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            user,
            token: data.token,
          },
        })
        return { success: true }
      } else {
        dispatch({ type: "SET_LOADING", payload: false })
        return { success: false, message: data.message || "Registration failed" }
      }
    } catch (error) {
      console.error("Registration error:", error)
      dispatch({ type: "SET_LOADING", payload: false })
      return { success: false, message: "Network error. Please try again." }
    }
  }

  const updateProfile = async (userData: { name?: string; email?: string; password?: string }): Promise<{
    success: boolean
    message?: string
  }> => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        return { success: false, message: "No authentication token found" }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/profile`, 
        {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        // Update token if new one is provided
        localStorage.setItem("token", data.token)

        const user = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
        }

        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            user,
            token: data.token,
          },
        })
        return { success: true, message: "Profile updated successfully" }
      } else {
        return { success: false, message: data.message || "Profile update failed" }
      }
    } catch (error) {
      console.error("Profile update error:", error)
      return { success: false, message: "Network error. Please try again." }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("adminToken")
    dispatch({ type: "LOGOUT" })
  }

  return (
    <AuthContext.Provider value={{ state, dispatch, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
