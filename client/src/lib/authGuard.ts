// lib/authGuard.ts
import { redirect } from '@tanstack/react-router'
import { useAuthStore } from './store'
import { toast } from 'sonner'

export function authGuard() {
  const user = useAuthStore.getState().user

  if (!user) {
    toast.error('You must be logged in to access this page.')
    throw redirect({
      to: '/auth',
      search: {
        redirect: null, // optional: add redirect back
      },
    })
  }

  return user // return user if needed
}
