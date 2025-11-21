import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldGroup } from '@/components/ui/field'

import { auth, googleProvider } from '../configs/firebase'
import {
  signInWithPopup,
  type UserCredential,
  type Auth,
  type AuthProvider,
} from 'firebase/auth'
import api from '@/configs/axiosinstance'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/lib/store'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const navigate = useNavigate()

  const handleLogin = async (): Promise<void> => {
    try {
      const result: UserCredential = await signInWithPopup(
        auth as Auth,
        googleProvider as AuthProvider,
      )
      const user = result.user
      const token = await user.getIdToken()
      console.log(token)
      const res = await api.post('/auth/', {
        token,
      })
      toast.success(res.data.message || 'Success')
      useAuthStore.getState().setUser(res.data.user)
      navigate({ to: '/profile' })
    } catch (error: any) {
      toast.error(error.message || 'Failed')
      console.error(error)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="backdrop-blur-xl bg-background/95 border-border/50 shadow-2xl shadow-black/10 dark:shadow-black/50 transition-all duration-500 hover:shadow-3xl hover:border-border/80 overflow-hidden">
        {/* Ambient gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />

        <CardHeader className="text-center space-y-3 relative z-10 pt-8 pb-6">
          <CardTitle className="text-3xl font-bold bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent tracking-tight">
            Welcome
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground/80">
            Login or Sign Up with your Apple or Google account
          </CardDescription>
        </CardHeader>

        <CardContent className="relative z-10 pb-8">
          <form>
            <FieldGroup>
              <Field className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleLogin}
                  className="h-12 relative group overflow-hidden border-border/60 hover:border-foreground/20 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  {/* Button gradient effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[5deg]"
                  >
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="font-medium relative z-10">
                    Login with Google
                  </span>
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
