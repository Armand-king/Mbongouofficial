"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { TrendingUp, TrendingDown, Wallet, Target, Plus, AlertTriangle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useErrorHandler } from "@/hooks/use-error-handler"

interface Transaction {
  id: string
  type: "INCOME" | "EXPENSE"
  amount: number
  description: string
  date: string
  category: {
    id: string
    name: string
    type: "INCOME" | "EXPENSE"
  }
}

interface Budget {
  id: string
  limit: number
  spent: number
  month: number
  year: number
  category: {
    id: string
    name: string
    type: "INCOME" | "EXPENSE"
  }
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()
  const { handleAsyncError } = useErrorHandler()

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchData = useCallback(async () => {
    if (!user || !mounted) return

    await handleAsyncError(
      async () => {
        const [transactionsRes, budgetsRes] = await Promise.all([fetch("/api/transactions"), fetch("/api/budgets")])

        if (transactionsRes.ok) {
          const transactionsData = await transactionsRes.json()
          setTransactions(transactionsData)
        }

        if (budgetsRes.ok) {
          const budgetsData = await budgetsRes.json()
          setBudgets(budgetsData)
        }
      },
      {
        fallbackMessage: "Impossible de charger les données du tableau de bord",
      },
    )

    setLoading(false)
  }, [user, mounted, handleAsyncError])

  useEffect(() => {
    if (mounted && user) {
      fetchData()
    }
  }, [mounted, user, fetchData])

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return transactionDate.getMonth() + 1 === currentMonth && transactionDate.getFullYear() === currentYear
    })
  }, [transactions, currentMonth, currentYear])

  const totalIncome = useMemo(() => {
    return currentMonthTransactions.filter((t) => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0)
  }, [currentMonthTransactions])

  const totalExpenses = useMemo(() => {
    return currentMonthTransactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0)
  }, [currentMonthTransactions])

  const balance = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses])

  // Update budgets with current spending
  const updatedBudgets = useMemo(() => {
    if (transactions.length === 0 || budgets.length === 0) return budgets

    const currentMonthExpenses = currentMonthTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce(
        (acc, t) => {
          acc[t.category.id] = (acc[t.category.id] || 0) + t.amount
          return acc
        },
        {} as Record<string, number>,
      )

    return budgets.map((budget) => ({
      ...budget,
      spent: currentMonthExpenses[budget.category.id] || 0,
    }))
  }, [budgets, currentMonthTransactions, transactions.length])

  const pieData = useMemo(() => {
    const expensesByCategory = currentMonthTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce(
        (acc, t) => {
          acc[t.category.name] = (acc[t.category.name] || 0) + t.amount
          return acc
        },
        {} as Record<string, number>,
      )

    return Object.entries(expensesByCategory).map(([category, amount]) => ({
      name: category,
      value: amount,
    }))
  }, [currentMonthTransactions])

  const COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4"]

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de vos données...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Tableau de Bord
            </h1>
            <p className="text-muted-foreground">
              Aperçu de vos finances pour {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenus</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+{totalIncome.toFixed(2)} FRCFA</div>
                <p className="text-xs text-muted-foreground">Ce mois-ci</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dépenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">-{totalExpenses.toFixed(2)} FRCFA</div>
                <p className="text-xs text-muted-foreground">Ce mois-ci</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solde</CardTitle>
                <Wallet className={`h-4 w-4 ${balance >= 0 ? "text-green-500" : "text-red-500"}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {balance >= 0 ? "+" : ""}
                  {balance.toFixed(2)} FRCFA
                </div>
                <p className="text-xs text-muted-foreground">Solde actuel</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Répartition des dépenses</CardTitle>
                <CardDescription>Par catégorie ce mois-ci</CardDescription>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} FRCFA`, "Montant"]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune dépense ce mois-ci</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Suivi des budgets</CardTitle>
                <CardDescription>Progression par catégorie</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {updatedBudgets.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mb-2">Aucun budget défini</p>
                    <p className="text-sm text-muted-foreground">
                      Allez dans les paramètres pour créer vos premiers budgets
                    </p>
                  </div>
                ) : (
                  updatedBudgets.map((budget) => {
                    const percentage = (budget.spent / budget.limit) * 100
                    const isOverBudget = budget.spent > budget.limit

                    return (
                      <div key={budget.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{budget.category.name}</span>
                          <div className="flex items-center space-x-2">
                            {isOverBudget && <AlertTriangle className="h-4 w-4 text-red-500" />}
                            <span className={`text-sm ${isOverBudget ? "text-red-600" : "text-muted-foreground"}`}>
                              {budget.spent.toFixed(2)} FRCFA / {budget.limit} FRCFA
                            </span>
                          </div>
                        </div>
                        <Progress
                          value={Math.min(percentage, 100)}
                          className={`h-2 ${isOverBudget ? "bg-red-100" : ""}`}
                        />
                        {isOverBudget && (
                          <p className="text-xs text-red-600">
                            Dépassement de {(budget.spent - budget.limit).toFixed(2)} FRCFA
                          </p>
                        )}
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>Gérez vos finances rapidement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button className="h-20 flex-col space-y-2 gradient-bg border-0 hover:scale-105 transition-transform">
                  <Plus className="h-6 w-6" />
                  <span>Ajouter une transaction</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2 hover:scale-105 transition-transform bg-transparent"
                >
                  <Target className="h-6 w-6" />
                  <span>Définir un budget</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2 hover:scale-105 transition-transform bg-transparent"
                >
                  <TrendingUp className="h-6 w-6" />
                  <span>Voir les statistiques</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col space-y-2 hover:scale-105 transition-transform bg-transparent"
                >
                  <Wallet className="h-6 w-6" />
                  <span>Historique</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
