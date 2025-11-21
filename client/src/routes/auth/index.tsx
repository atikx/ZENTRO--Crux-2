import { createFileRoute } from '@tanstack/react-router'
import { GalleryVerticalEnd } from 'lucide-react'
import { LoginForm } from '@/components/login-form'


export const Route = createFileRoute('/auth/')({
  component: RouteComponent,
})

function RouteComponent() {


  return (
    <div className="relative h-[90vh] flex flex-col items-center justify-center gap-6 p-6 md:p-10 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-muted animate-gradient-shift" />

      {/* Ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float-delayed" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="flex w-full max-w-sm flex-col gap-6 relative z-10">
        <a
          href="#"
          className="flex items-center gap-3 self-center font-semibold group transition-all duration-300 hover:scale-105"
        >
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg shadow-lg shadow-primary/30 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/40 group-hover:rotate-[-5deg]">
            <GalleryVerticalEnd className="size-5 transition-transform duration-300 group-hover:scale-110" />
          </div>
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
