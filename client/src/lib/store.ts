import { create } from 'zustand'

export interface UserInterface {
  id: string
  name: string
  email: string
  username: string
  avatar: string
}

interface AuthState {
  user: UserInterface | null
  setUser: (user: UserInterface) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>((set: any) => ({
  user: null,
  setUser: (user: UserInterface) => set({ user }),
  clearUser: () => set({ user: null }),
}))
