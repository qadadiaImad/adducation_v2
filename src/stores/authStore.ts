import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '@/services/authService'

export interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  jobTitle?: string
  skills?: string[]
  userType: 'student' | 'jobSeeker' | 'examCandidate'
  createdAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: any) => Promise<boolean>
  logout: () => void
  checkAuth: () => void
  updateProfile: (data: Partial<User>) => Promise<boolean>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const result = await authService.login(email, password)
          if (result.success) {
            set({ 
              user: result.user, 
              token: result.token, 
              isLoading: false 
            })
            return true
          }
          set({ isLoading: false })
          return false
        } catch (error) {
          set({ isLoading: false })
          return false
        }
      },

      register: async (userData: any) => {
        set({ isLoading: true })
        try {
          const result = await authService.register(userData)
          if (result.success) {
            set({ 
              user: result.user, 
              token: result.token, 
              isLoading: false 
            })
            return true
          }
          set({ isLoading: false })
          return false
        } catch (error) {
          set({ isLoading: false })
          return false
        }
      },

      logout: () => {
        authService.logout()
        set({ user: null, token: null })
      },

      checkAuth: () => {
        const token = authService.getToken()
        const user = authService.getCurrentUser()
        if (token && user) {
          set({ user, token, isLoading: false })
        } else {
          set({ user: null, token: null, isLoading: false })
        }
      },

      updateProfile: async (data: Partial<User>) => {
        const { user } = get()
        if (!user) return false
        
        try {
          const updatedUser = await authService.updateProfile(user.id, data)
          if (updatedUser) {
            set({ user: updatedUser })
            return true
          }
          return false
        } catch (error) {
          return false
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token 
      }),
    }
  )
)