"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import SplashScreen from "@/components/splash-screen"
import HomePage from "@/components/home-page"

export default function Page() {
  const [showSplash, setShowSplash] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { user, loading } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(() => {
        setShowSplash(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [mounted])

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // AuthProvider will redirect to login
  }

  if (showSplash) {
    return <SplashScreen />
  }

  return <HomePage />
}
