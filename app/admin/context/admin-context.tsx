"use client"

import type React from "react"

import { createContext, useContext, useReducer, type ReactNode } from "react"

interface AdminUser {
  id: string
  email: string
  name: string
  role: string
}

interface AdminState {
  user: AdminUser | null
  isLoading: boolean
}

type AdminAction =
  | { type: "SET_USER"; payload: AdminUser }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOGOUT" }

const AdminContext = createContext<{
  state: AdminState
  dispatch: React.Dispatch<AdminAction>
} | null>(null)

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "LOGOUT":
      return { ...state, user: null }
    default:
      return state
  }
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(adminReducer, {
    user: null,
    isLoading: false,
  })

  return <AdminContext.Provider value={{ state, dispatch }}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
