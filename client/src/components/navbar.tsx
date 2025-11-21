// components/navbar.tsx
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Video,
  Radio,
  Search,
  User,
  Settings,
  LogOut,
  Menu,
  Home,
  Compass,
  LayoutDashboard,
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/lib/store'

interface NavbarProps {
  user?: {
    name: string
    username: string
    email: string
    avatar?: string
  }
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const user = useAuthStore((state) => state.user)

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Video className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">StreamHub</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium transition-colors hover:text-primary"
            activeProps={{ className: 'text-primary' }}
          >
            <Home className="h-4 w-4 inline mr-1" />
            Home
          </Link>
          <Link
            to="/browse"
            className="text-sm font-medium transition-colors hover:text-primary"
            activeProps={{ className: 'text-primary' }}
          >
            <Compass className="h-4 w-4 inline mr-1" />
            Browse
          </Link>
          {user && (
            <Link
              to="/dashboard"
              className="text-sm font-medium transition-colors hover:text-primary"
              activeProps={{ className: 'text-primary' }}
            >
              <LayoutDashboard className="h-4 w-4 inline mr-1" />
              Dashboard
            </Link>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Search Button */}
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          {user ? (
            <>
              {/* Start Streaming Button */}
              <Button asChild className="hidden md:flex">
                <Link to="/stream/create">
                  <Radio className="h-4 w-4 mr-2" />
                  Go Live
                </Link>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuContent className="w-56 z-[100]" align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenu>
            </>
          ) : (
            <>
              {/* Login/Signup for non-authenticated users */}
              <Button variant="ghost" asChild>
                <Link to="/auth">Log in</Link>
              </Button>
              <Button asChild className="hidden md:flex">
                <Link to="/auth">Sign up</Link>
              </Button>
            </>
          )}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                {user && (
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {user.username}
                      </span>
                    </div>
                  </div>
                )}

                <Link
                  to="/"
                  className="flex items-center gap-3 text-lg font-medium hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  Home
                </Link>

                <Link
                  to="/"
                  className="flex items-center gap-3 text-lg font-medium hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Compass className="h-5 w-5" />
                  Browse
                </Link>

                {user && (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 text-lg font-medium hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                  </Link>
                )}

                {user && (
                  <>
                    <Link
                      to="/stream/create"
                      className="flex items-center gap-3 text-lg font-medium hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Radio className="h-5 w-5" />
                      Go Live
                    </Link>

                    <div className="pt-4 mt-4 border-t flex flex-col gap-4">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 text-base hover:text-primary transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        Profile
                      </Link>

                      <Link
                        to="/"
                        className="flex items-center gap-3 text-base hover:text-primary transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings className="h-5 w-5" />
                        Settings
                      </Link>

                      <button
                        className="flex items-center gap-3 text-base text-destructive hover:text-destructive/80 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <LogOut className="h-5 w-5" />
                        Log out
                      </button>
                    </div>
                  </>
                )}

                {!user && (
                  <div className="flex flex-col gap-3 mt-4">
                    <Button asChild>
                      <Link to="/auth" onClick={() => setIsOpen(false)}>
                        Log in
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/auth" onClick={() => setIsOpen(false)}>
                        Sign up
                      </Link>
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
