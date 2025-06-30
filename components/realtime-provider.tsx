"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface RealtimeContextType {
  isConnected: boolean
  lastUpdate: Date | null
}

const RealtimeContext = createContext<RealtimeContextType>({
  isConnected: false,
  lastUpdate: null,
})

export const useRealtime = () => {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error("useRealtime must be used within a RealtimeProvider")
  }
  return context
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  const showToast = useCallback(
    (title: string, description: string) => {
      if (mounted) {
        toast({ title, description })
      }
    },
    [mounted, toast],
  )

  const updateLastUpdate = useCallback(() => {
    if (mounted) {
      setLastUpdate(new Date())
    }
  }, [mounted])

  useEffect(() => {
    if (!mounted || !user) return

    let transactionsChannel: any
    let budgetsChannel: any
    let categoriesChannel: any

    const setupChannels = () => {
      // Subscribe to realtime changes for transactions
      transactionsChannel = supabase
        .channel("transactions_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "transactions",
            filter: `userId=eq.${user.id}`,
          },
          (payload) => {
            console.log("Transaction change received:", payload)
            updateLastUpdate()

            // Show toast notification for changes made by other clients
            if (payload.eventType === "INSERT") {
              showToast("Nouvelle transaction", "Une transaction a été ajoutée depuis un autre appareil")
            } else if (payload.eventType === "UPDATE") {
              showToast("Transaction modifiée", "Une transaction a été modifiée depuis un autre appareil")
            } else if (payload.eventType === "DELETE") {
              showToast("Transaction supprimée", "Une transaction a été supprimée depuis un autre appareil")
            }
          },
        )
        .subscribe((status, err) => {
          console.log("Realtime subscribe status:", status, err)
          if (status === "SUBSCRIBED") {
            setIsConnected(true)
            console.log("Connected to realtime transactions")
          } else if (status === "CHANNEL_ERROR") {
            setIsConnected(false)
            if (err && Object.keys(err).length > 0) {
              console.error(
                "Erreur de connexion au canal realtime transactions :",
                err,
                JSON.stringify(err)
              )
            } else {
              console.error(
                "Erreur de connexion au canal realtime transactions : aucune erreur transmise"
              )
            }
            // Pour le debug, loguer tout l'objet status/err
            console.debug("Détail de l'événement d'erreur :", { status, err })
            // Log du channel pour diagnostic avancé
            console.debug("transactionsChannel :", transactionsChannel)
          }
        })

      // Subscribe to realtime changes for budgets
      budgetsChannel = supabase
        .channel("budgets_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "budgets",
            filter: `userId=eq.${user.id}`,
          },
          (payload) => {
            console.log("Budget change received:", payload)
            updateLastUpdate()

            if (payload.eventType === "INSERT") {
              showToast("Nouveau budget", "Un budget a été créé depuis un autre appareil")
            } else if (payload.eventType === "UPDATE") {
              showToast("Budget modifié", "Un budget a été modifié depuis un autre appareil")
            }
          },
        )
        .subscribe()

      // Subscribe to realtime changes for categories
      categoriesChannel = supabase
        .channel("categories_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "categories",
            filter: `userId=eq.${user.id}`,
          },
          (payload) => {
            console.log("Category change received:", payload)
            updateLastUpdate()

            if (payload.eventType === "INSERT") {
              showToast("Nouvelle catégorie", "Une catégorie a été créée depuis un autre appareil")
            } else if (payload.eventType === "UPDATE") {
              showToast("Catégorie modifiée", "Une catégorie a été modifiée depuis un autre appareil")
            }
          },
        )
        .subscribe()
    }

    setupChannels()

    return () => {
      if (transactionsChannel) {
        transactionsChannel.unsubscribe()
      }
      if (budgetsChannel) {
        budgetsChannel.unsubscribe()
      }
      if (categoriesChannel) {
        categoriesChannel.unsubscribe()
      }
      setIsConnected(false)
    }
  }, [mounted, user, supabase, showToast, updateLastUpdate])

  const value = {
    isConnected,
    lastUpdate,
  }

  if (!mounted) {
    return <>{children}</>
  }

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
}
