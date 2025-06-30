"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, Calendar, Target, Award, AlertCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

export default function Statistics() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchTransactions()
    }
  }, [user])

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/transactions")
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      } else {
        throw new Error("Failed to fetch transactions")
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les transactions par année
  const yearTransactions = useMemo(() => {
    return transactions.filter((t) => new Date(t.date).getFullYear() === Number.parseInt(selectedYear))
  }, [transactions, selectedYear])

  // Données pour le graphique d'évolution mensuelle
  const monthlyData = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const month = index
      const monthTransactions = yearTransactions.filter((t) => new Date(t.date).getMonth() === month)

      const income = monthTransactions.filter((t) => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0)
      const expenses = monthTransactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0)

      return {
        month: new Date(2024, month).toLocaleDateString("fr-FR", { month: "short" }),
        revenus: income,
        dépenses: expenses,
        solde: income - expenses,
      }
    })
  }, [yearTransactions])

  // Top catégories de dépenses
  const expensesByCategory = useMemo(() => {
    return yearTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce(
        (acc, t) => {
          acc[t.category.name] = (acc[t.category.name] || 0) + t.amount
          return acc
        },
        {} as Record<string, number>,
      )
  }, [yearTransactions])

  // Wrap other calculations in useMemo as well
  const topCategories = useMemo(() => {
    return Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }))
  }, [expensesByCategory])

  const pieData = useMemo(() => {
    return topCategories.map(({ category, amount }) => ({
      name: category,
      value: amount,
    }))
  }, [topCategories])

  const totalIncome = useMemo(() => {
    return yearTransactions.filter((t) => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0)
  }, [yearTransactions])

  const totalExpenses = useMemo(() => {
    return yearTransactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0)
  }, [yearTransactions])

  const averageMonthlyIncome = useMemo(() => totalIncome / 12, [totalIncome])
  const averageMonthlyExpenses = useMemo(() => totalExpenses / 12, [totalExpenses])
  const savingsRate = useMemo(
    () => (totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0),
    [totalIncome, totalExpenses],
  )

  const monthWithMostExpenses = useMemo(() => {
    return monthlyData.reduce((max, current) => (current.dépenses > max.dépenses ? current : max))
  }, [monthlyData])

  const availableYears = useMemo(() => {
    return [...new Set(transactions.map((t) => new Date(t.date).getFullYear()))].sort((a, b) => b - a)
  }, [transactions])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* En-tête */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Statistiques financières
            </h1>
            <p className="text-muted-foreground">Analysez vos habitudes financières en détail</p>
            <div className="flex justify-center">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sélectionner une année" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.length > 0 ? (
                    availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value={new Date().getFullYear().toString()}>{new Date().getFullYear()}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cartes de statistiques */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux d'épargne</CardTitle>
                <Target className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${savingsRate >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {savingsRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {savingsRate >= 20 ? "Excellent !" : savingsRate >= 10 ? "Bien" : "À améliorer"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenus moyens/mois</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{averageMonthlyIncome.toFixed(2)}  Frcfa</div>
                <p className="text-xs text-muted-foreground">Moyenne mensuelle</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dépenses moyennes/mois</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{averageMonthlyExpenses.toFixed(2)}  Frcfa</div>
                <p className="text-xs text-muted-foreground">Moyenne mensuelle</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mois le plus dépensier</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{monthWithMostExpenses.month}</div>
                <p className="text-xs text-muted-foreground">{monthWithMostExpenses.dépenses.toFixed(2)}  Frcfa dépensés</p>
              </CardContent>
            </Card>
          </div>

          {/* Graphique d'évolution mensuelle */}
          <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Évolution mensuelle {selectedYear}</CardTitle>
              <CardDescription>Revenus, dépenses et solde par mois</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}  Frcfa`, ""]} />
                  <Legend />
                  <Line type="monotone" dataKey="revenus" stroke="#10B981" strokeWidth={3} name="Revenus" />
                  <Line type="monotone" dataKey="dépenses" stroke="#EF4444" strokeWidth={3} name="Dépenses" />
                  <Line type="monotone" dataKey="solde" stroke="#3B82F6" strokeWidth={3} name="Solde" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Graphiques des catégories */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top catégories (barres) */}
            <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Top 5 des catégories de dépenses</CardTitle>
                <CardDescription>Vos principales sources de dépenses</CardDescription>
              </CardHeader>
              <CardContent>
                {topCategories.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topCategories} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" width={80} />
                      <Tooltip formatter={(value) => [`${value}  Frcfa`, "Montant"]} />
                      <Bar dataKey="amount" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune dépense enregistrée</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Répartition (camembert) */}
            <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Répartition des dépenses</CardTitle>
                <CardDescription>Distribution par catégorie</CardDescription>
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
                      <Tooltip formatter={(value) => [`${value}  Frcfa`, "Montant"]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune donnée à afficher</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Insights et conseils */}
          <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <span>Insights et conseils</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">💡 Points positifs</h3>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    {savingsRate > 0 && <li>• Vous épargnez {savingsRate.toFixed(1)}% de vos revenus</li>}
                    {totalIncome > totalExpenses && <li>• Vos revenus dépassent vos dépenses</li>}
                    {yearTransactions.length > 0 && <li>• Vous suivez régulièrement vos finances</li>}
                  </ul>
                </div>

                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">⚠️ Points d'amélioration</h3>
                  <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                    {savingsRate < 10 && <li>• Essayez d'épargner au moins 10% de vos revenus</li>}
                    {topCategories.length > 0 && <li>• Votre plus grosse dépense : {topCategories[0].category}</li>}
                    <li>• Définissez des budgets pour mieux contrôler vos dépenses</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
