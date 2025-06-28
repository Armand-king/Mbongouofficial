"use client"

import { useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface ErrorHandlerOptions {
  showToast?: boolean
  logError?: boolean
  fallbackMessage?: string
}

export function useErrorHandler() {
  const { toast } = useToast()

  const handleError = useCallback(
    (error: unknown, options: ErrorHandlerOptions = {}) => {
      const { showToast = true, logError = true, fallbackMessage = "Une erreur inattendue s'est produite" } = options

      // Log error to console in development
      if (logError && process.env.NODE_ENV === "development") {
        console.error("Error handled:", error)
      }

      // Extract error message
      let errorMessage = fallbackMessage
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }

      // Show toast notification
      if (showToast) {
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        })
      }

      return errorMessage
    },
    [toast],
  )

  const handleAsyncError = useCallback(
    async (asyncFn: () => Promise<any>, options: ErrorHandlerOptions = {}) => {
      try {
        return await asyncFn()
      } catch (error) {
        handleError(error, options)
        return null // Return null instead of re-throwing to prevent crashes
      }
    },
    [handleError],
  )

  return {
    handleError,
    handleAsyncError,
  }
}
