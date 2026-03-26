"use client"

import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"
import { Toaster } from "@/components/ui/sonner"
import { LogOut } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"

interface Props {
  children: ReactNode
  user?: {
    firstName: string
    lastName: string
    email: string
  }
}

export default function ChildWrapper({ children, user }: Props) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      const response = await fetch('/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('¡Hasta luego! 👋')
        setTimeout(() => {
          window.location.href = '/login'
        }, 500)
      } else {
        toast.error('Error al cerrar sesión')
        setIsLoggingOut(false)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cerrar sesión')
      setIsLoggingOut(false)
    }
  }

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Usuario'
  const email = user?.email || 'email@example.com'
  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : 'U'

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
      <div className="min-h-screen bg-gradient-to-b from-sky-100 via-blue-50 to-sky-50">
        {/* Main Content */}
        <main className="min-h-screen overflow-auto">
          {children}
        </main>

        {/* Floating User Menu - Bottom Right */}
        <div className="fixed bottom-6 right-6 z-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="lg"
                className="rounded-full w-16 h-16 p-0 shadow-lg bg-gradient-to-br from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 transition-all hover:scale-110"
              >
                <Avatar className="h-14 w-14 border-2 border-white">
                  <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-xl mb-20">
              <DropdownMenuLabel>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-bold">{fullName}</p>
                    <p className="text-xs text-muted-foreground">{email}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="cursor-pointer font-bold text-base py-2"
              >
                <LogOut className="h-5 w-5 mr-2" />
                {isLoggingOut ? '⏳ Cerrando...' : '👋 Cerrar sesión'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Toaster />
      </div>
    </ThemeProvider>
  )
}
