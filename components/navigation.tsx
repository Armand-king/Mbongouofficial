"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Home, BarChart3, Plus, History, TrendingUp, Settings, Moon, Sun, LogOut, User, HelpCircle } from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "@/components/auth-provider"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavigationProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { id: "home", label: "Accueil", icon: Home },
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "add", label: "Ajouter", icon: Plus },
    { id: "history", label: "Historique", icon: History },
    { id: "statistics", label: "Stats", icon: TrendingUp },
    { id: "how-to", label: "Comment ?", icon: HelpCircle },
    { id: "settings", label: "Paramètres", icon: Settings },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <Image
                src="./mbongou.jpeg"
                alt=" Mbongou.App Logo"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
               Mbongou.App
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "default" : "ghost"}
                size="sm"
                onClick={() => onPageChange(item.id)}
                className="transition-all hover:scale-105"
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hover:scale-105 transition-transform"
            >
              {mounted && (
                <>
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </>
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:scale-105 transition-transform">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm">
                    <div className="font-medium">{user?.user_metadata?.name || "Utilisateur"}</div>
                    <div className="text-muted-foreground">{user?.email}</div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex overflow-x-auto space-x-1 pb-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onPageChange(item.id)}
              className="flex-shrink-0 transition-all"
            >
              <item.icon className="h-4 w-4 mr-1" />
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  )
}
