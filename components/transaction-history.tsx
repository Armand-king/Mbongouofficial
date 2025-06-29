"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Search, Filter, FileSpreadsheet, Trash2, Plus, Minus, CalendarIcon, Edit, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useAuth } from "@/components/auth-provider"
import { exportTransactionsToExcel } from "@/lib/excel-export"

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

interface Category {
  id: string
  name: string
  type: "INCOME" | "EXPENSE"
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "INCOME" | "EXPENSE">("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [dateRange, setDateRange] = useState<"all" | "month" | "year" | "custom">("all")
  const [customStartDate, setCustomStartDate] = useState<Date>()
  const [customEndDate, setCustomEndDate] = useState<Date>()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [editForm, setEditForm] = useState({
    type: "EXPENSE" as "INCOME" | "EXPENSE",
    amount: "",
    categoryId: "",
    description: "",
    date: "",
  })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const [transactionsRes, categoriesRes] = await Promise.all([fetch("/api/transactions"), fetch("/api/categories")])

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json()
        setTransactions(transactionsData)
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Enhanced filtering with date range support
  const filteredTransactions = useMemo(() => {
    let filtered = transactions

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.category.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((t) => t.type === filterType)
    }

    // Filter by category
    if (filterCategory !== "all") {
      filtered = filtered.filter((t) => t.category.id === filterCategory)
    }

    // Filter by date range
    if (dateRange !== "all") {
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.date)

        switch (dateRange) {
          case "month":
            return (
              transactionDate.getMonth() === Number.parseInt(selectedMonth) &&
              transactionDate.getFullYear() === Number.parseInt(selectedYear)
            )
          case "year":
            return transactionDate.getFullYear() === Number.parseInt(selectedYear)
          case "custom":
            if (customStartDate && customEndDate) {
              return transactionDate >= customStartDate && transactionDate <= customEndDate
            }
            return true
          default:
            return true
        }
      })
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [
    transactions,
    searchTerm,
    filterType,
    filterCategory,
    dateRange,
    selectedMonth,
    selectedYear,
    customStartDate,
    customEndDate,
  ])

  const openEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setEditForm({
      type: transaction.type,
      amount: transaction.amount.toString(),
      categoryId: transaction.category.id,
      description: transaction.description || "",
      date: transaction.date.split("T")[0],
    })
  }

  const updateTransaction = async () => {
    if (!editingTransaction || !editForm.amount || !editForm.categoryId || !editForm.date) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/transactions/${editingTransaction.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: editForm.type.toLowerCase(),
          amount: Number.parseFloat(editForm.amount),
          categoryId: editForm.categoryId,
          description: editForm.description,
          date: editForm.date,
        }),
      })

      if (response.ok) {
        const updatedTransaction = await response.json()
        setTransactions(transactions.map((t) => (t.id === editingTransaction.id ? updatedTransaction : t)))
        setEditingTransaction(null)

        toast({
          title: "Transaction modifiée",
          description: "La transaction a été mise à jour avec succès",
        })
      } else {
        throw new Error("Failed to update transaction")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la transaction",
        variant: "destructive",
      })
    }
  }

  const deleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setTransactions(transactions.filter((t) => t.id !== id))
        setDeleteConfirm(null)

        toast({
          title: "Transaction supprimée",
          description: "La transaction a été supprimée avec succès",
        })
      } else {
        throw new Error("Failed to delete transaction")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la transaction",
        variant: "destructive",
      })
    }
  }

  const exportToExcel = () => {
    try {
      const filename = exportTransactionsToExcel(filteredTransactions)
      toast({
        title: "Export réussi",
        description: `Vos transactions ont été exportées vers ${filename}`,
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'exporter les données",
        variant: "destructive",
      })
    }
  }

  // Générer une liste de catégories uniques par ID
  const availableCategories = Array.from(
    new Map(transactions.map((t) => [t.category.id, { id: t.category.id, name: t.category.name }])).values()
  )
  const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ]
  const years = [...new Set(transactions.map((t) => new Date(t.date).getFullYear()))].sort((a, b) => b - a)

  const totalIncome = filteredTransactions.filter((t) => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = filteredTransactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0)

  const filteredCategoriesForEdit = categories.filter((cat) => cat.type === editForm.type)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de l'historique...</p>
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Historique des transactions
            </h1>
            <p className="text-muted-foreground">Consultez et gérez toutes vos transactions</p>
          </div>

          {/* Résumé */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenus</CardTitle>
                <Plus className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+{totalIncome.toFixed(2)}€</div>
                <p className="text-xs text-muted-foreground">
                  {filteredTransactions.filter((t) => t.type === "INCOME").length} transactions
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Dépenses</CardTitle>
                <Minus className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">-{totalExpenses.toFixed(2)}€</div>
                <p className="text-xs text-muted-foreground">
                  {filteredTransactions.filter((t) => t.type === "EXPENSE").length} transactions
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solde</CardTitle>
                <CalendarIcon className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${(totalIncome - totalExpenses) >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {totalIncome - totalExpenses >= 0 ? "+" : ""}
                  {(totalIncome - totalExpenses).toFixed(2)}€
                </div>
                <p className="text-xs text-muted-foreground">{filteredTransactions.length} transactions au total</p>
              </CardContent>
            </Card>
          </div>

          {/* Filtres et recherche */}
          <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filtres et recherche</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="INCOME">Revenus</SelectItem>
                    <SelectItem value="EXPENSE">Dépenses</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {availableCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={dateRange} onValueChange={(value) => setDateRange(value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les dates</SelectItem>
                    <SelectItem value="month">Par mois</SelectItem>
                    <SelectItem value="year">Par année</SelectItem>
                    <SelectItem value="custom">Période personnalisée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date range specific controls */}
              {dateRange === "month" && (
                <div className="grid md:grid-cols-2 gap-4">
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Mois" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Année" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {dateRange === "year" && (
                <div className="grid md:grid-cols-1 gap-4">
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Année" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {dateRange === "custom" && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Date de début</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customStartDate ? format(customStartDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={customStartDate} onSelect={setCustomStartDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date de fin</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customEndDate ? format(customEndDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={customEndDate} onSelect={setCustomEndDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              {/* Export button */}
              <div className="flex justify-start">
                <Button
                  onClick={exportToExcel}
                  variant="outline"
                  className="hover:scale-105 transition-transform bg-transparent border-green-600 text-green-600 hover:bg-green-50"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exporter Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tableau des transactions */}
          <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
              <CardDescription>
                Liste de toutes vos transactions filtrées - triées du plus récent au plus ancien
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Aucune transaction trouvée</p>
                  <p className="text-sm text-muted-foreground">Essayez de modifier vos filtres</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-green-600">Entrée</TableHead>
                        <TableHead className="text-red-600">Sortie</TableHead>
                        <TableHead>Motif</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {new Date(transaction.date).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell>
                            {transaction.type === "INCOME" && (
                              <span className="text-green-600 font-semibold">+{transaction.amount.toFixed(2)}€</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {transaction.type === "EXPENSE" && (
                              <span className="text-red-600 font-semibold">-{transaction.amount.toFixed(2)}€</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="text-xs">
                                {transaction.category.name}
                              </Badge>
                              {transaction.description && (
                                <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                                  {transaction.description}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(transaction)}
                                className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteConfirm(transaction.id)}
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de modification */}
      <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier la transaction</DialogTitle>
            <DialogDescription>Modifiez les détails de votre transaction</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Type de transaction</Label>
              <RadioGroup
                value={editForm.type}
                onValueChange={(value) => setEditForm({ ...editForm, type: value as "INCOME" | "EXPENSE" })}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="EXPENSE" id="edit-expense" />
                    <Label htmlFor="edit-expense" className="flex items-center space-x-2 cursor-pointer">
                      <Minus className="h-4 w-4 text-red-500" />
                      <span>Dépense</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="INCOME" id="edit-income" />
                    <Label htmlFor="edit-income" className="flex items-center space-x-2 cursor-pointer">
                      <Plus className="h-4 w-4 text-green-500" />
                      <span>Revenu</span>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-amount">Montant (€)</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Catégorie</Label>
              <Select
                value={editForm.categoryId}
                onValueChange={(value) => setEditForm({ ...editForm, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategoriesForEdit.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTransaction(null)}>
              Annuler
            </Button>
            <Button
              onClick={updateTransaction}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 border-0 text-white"
            >
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Confirmer la suppression</span>
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette transaction ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={() => deleteConfirm && deleteTransaction(deleteConfirm)}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
