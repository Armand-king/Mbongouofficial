"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Settings, Palette, Trash2, Plus, Bell, Shield, Database, Edit, FileSpreadsheet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"
import { useAuth } from "@/components/auth-provider"
import { exportTransactionsToExcel, exportBudgetsToExcel } from "@/lib/excel-export"

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

interface Category {
  id: string
  name: string
  type: "INCOME" | "EXPENSE"
}

interface UserSettings {
  id: string
  theme: string
  notifications: boolean
  autoSave: boolean
}

interface SettingsPageProps {
  onNavigate?: (page: string) => void
}

export default function SettingsPage({ onNavigate }: SettingsPageProps = {}) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [newCategory, setNewCategory] = useState("")
  const [newCategoryType, setNewCategoryType] = useState<"INCOME" | "EXPENSE">("EXPENSE")
  const [newBudgetCategoryId, setNewBudgetCategoryId] = useState("")
  const [newBudget, setNewBudget] = useState("")
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [editBudgetAmount, setEditBudgetAmount] = useState("")
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editCategoryName, setEditCategoryName] = useState("")
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave] = useState(true)
  const [loading, setLoading] = useState(true)
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const [budgetsRes, categoriesRes, settingsRes] = await Promise.all([
        fetch("/api/budgets"),
        fetch("/api/categories"),
        fetch("/api/settings"),
      ])

      if (budgetsRes.ok) {
        const budgetsData = await budgetsRes.json()
        setBudgets(budgetsData)
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData)
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json()
        setUserSettings(settingsData)
        setNotifications(settingsData.notifications)
        setAutoSave(settingsData.autoSave)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme,
          notifications,
          autoSave,
        }),
      })

      if (response.ok) {
        toast({
          title: "Paramètres sauvegardés",
          description: "Vos préférences ont été mises à jour",
        })
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive",
      })
    }
  }

  const addCategory = async () => {
    if (!newCategory.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un nom de catégorie",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCategory.trim(),
          type: newCategoryType,
        }),
      })

      if (response.ok) {
        const newCategoryData = await response.json()
        setCategories([...categories, newCategoryData])
        setNewCategory("")

        toast({
          title: "Catégorie ajoutée",
          description: `La catégorie "${newCategory}" a été ajoutée`,
        })
      } else {
        throw new Error("Failed to create category")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la catégorie",
        variant: "destructive",
      })
    }
  }

  const deleteCategory = async (categoryId: string, categoryName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${categoryName}" ?`)) {
      try {
        const response = await fetch(`/api/categories/${categoryId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          setCategories(categories.filter((cat) => cat.id !== categoryId))
          setBudgets(budgets.filter((budget) => budget.category.id !== categoryId))

          toast({
            title: "Catégorie supprimée",
            description: `La catégorie "${categoryName}" a été supprimée`,
          })
        } else {
          throw new Error("Failed to delete category")
        }
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la catégorie",
          variant: "destructive",
        })
      }
    }
  }

  const updateCategory = async () => {
    if (!editingCategory || !editCategoryName.trim()) return

    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editCategoryName.trim(),
        }),
      })

      if (response.ok) {
        const updatedCategory = await response.json()
        setCategories(categories.map((cat) => (cat.id === editingCategory.id ? updatedCategory : cat)))
        setEditingCategory(null)
        setEditCategoryName("")

        toast({
          title: "Catégorie modifiée",
          description: `La catégorie a été renommée en "${editCategoryName.trim()}"`,
        })
      } else {
        throw new Error("Failed to update category")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la catégorie",
        variant: "destructive",
      })
    }
  }

  const addBudget = async () => {
    if (!newBudgetCategoryId || !newBudget) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryId: newBudgetCategoryId,
          limit: Number.parseFloat(newBudget),
        }),
      })

      if (response.ok) {
        const newBudgetData = await response.json()
        setBudgets([...budgets, newBudgetData])
        setNewBudgetCategoryId("")
        setNewBudget("")

        const categoryName = categories.find((cat) => cat.id === newBudgetCategoryId)?.name
        toast({
          title: "Budget ajouté",
          description: `Budget de ${newBudget}€ défini pour ${categoryName}`,
        })
      } else {
        throw new Error("Failed to create budget")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le budget",
        variant: "destructive",
      })
    }
  }

  const updateBudget = async () => {
    if (!editingBudget || !editBudgetAmount) return

    try {
      const response = await fetch(`/api/budgets/${editingBudget.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          limit: Number.parseFloat(editBudgetAmount),
        }),
      })

      if (response.ok) {
        const updatedBudget = await response.json()
        setBudgets(budgets.map((budget) => (budget.id === editingBudget.id ? updatedBudget : budget)))
        setEditingBudget(null)
        setEditBudgetAmount("")

        toast({
          title: "Budget modifié",
          description: `Budget pour ${editingBudget.category.name} mis à jour`,
        })
      } else {
        throw new Error("Failed to update budget")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le budget",
        variant: "destructive",
      })
    }
  }

  const deleteBudget = async (budgetId: string, categoryName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le budget pour "${categoryName}" ?`)) {
      try {
        const response = await fetch(`/api/budgets/${budgetId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          setBudgets(budgets.filter((b) => b.id !== budgetId))

          toast({
            title: "Budget supprimé",
            description: `Le budget pour ${categoryName} a été supprimé`,
          })
        } else {
          throw new Error("Failed to delete budget")
        }
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le budget",
          variant: "destructive",
        })
      }
    }
  }

  const exportTransactionsData = async () => {
    try {
      const response = await fetch("/api/transactions")
      if (response.ok) {
        const transactions = await response.json()
        const filename = exportTransactionsToExcel(transactions)
        toast({
          title: "Export réussi",
          description: `Vos transactions ont été exportées vers ${filename}`,
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'exporter les données",
        variant: "destructive",
      })
    }
  }

  const exportBudgetsData = async () => {
    try {
      const filename = exportBudgetsToExcel(budgets)
      toast({
        title: "Export réussi",
        description: `Vos budgets ont été exportés vers ${filename}`,
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'exporter les budgets",
        variant: "destructive",
      })
    }
  }

  const customCategories = categories.filter(
    (cat) =>
      ![
        "Alimentation",
        "Transport",
        "Loisirs",
        "Shopping",
        "Logement",
        "Éducation",
        "Santé",
        "Cadeaux",
        "Salaire",
        "Bourse",
        "Freelance",
        "Famille",
        "Autre",
      ].includes(cat.name),
  )

  // Déduplique les budgets par id pour éviter les clés dupliquées dans le rendu
  const uniqueBudgets = Array.from(new Map(budgets.map(b => [b.id, b])).values())

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des paramètres...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Paramètres
            </h1>
            <p className="text-muted-foreground">Personnalisez votre expérience MBONGOU</p>
          </div>

          <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Apparence</span>
              </CardTitle>
              <CardDescription>Personnalisez l'apparence de l'application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Thème</Label>
                  <p className="text-sm text-muted-foreground">Choisissez votre thème préféré</p>
                </div>
                <Select value={theme || "system"} onValueChange={(value) => setTheme(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="system">Système</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Gestion des catégories</span>
              </CardTitle>
              <CardDescription>Créez et gérez vos catégories personnalisées</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Ajouter une nouvelle catégorie</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="categoryType">Type</Label>
                    <Select
                      value={newCategoryType}
                      onValueChange={(value) => setNewCategoryType(value as "INCOME" | "EXPENSE")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EXPENSE">Dépense</SelectItem>
                        <SelectItem value="INCOME">Revenu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="categoryName">Nom de la catégorie</Label>
                    <Input
                      id="categoryName"
                      placeholder="Ex: Streaming, Freelance..."
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    />
                  </div>


                  
                  <div className="flex items-end">
                    <Button
                      onClick={addCategory}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 border-0 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Catégories personnalisées</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3 text-red-600">Dépenses</h4>
                    {customCategories.filter((cat) => cat.type === "EXPENSE").length === 0 ? (
                      <p className="text-muted-foreground text-sm">Aucune catégorie personnalisée</p>
                    ) : (
                      <div className="space-y-2">
                        {customCategories
                          .filter((cat) => cat.type === "EXPENSE")
                          .map((category) => (
                            <div
                              key={category.id}
                              className="flex items-center justify-between p-3 border rounded-lg bg-white/30"
                            >
                              <Badge variant="destructive">{category.name}</Badge>
                              <div className="flex items-center space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setEditingCategory(category)
                                        setEditCategoryName(category.name)
                                      }}
                                      className="h-8 w-8 text-blue-500 hover:text-blue-700"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Modifier la catégorie</DialogTitle>
                                      <DialogDescription>
                                        Modifiez le nom de la catégorie "{category.name}"
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="editCategoryName">Nouveau nom</Label>
                                        <Input
                                          id="editCategoryName"
                                          value={editCategoryName}
                                          onChange={(e) => setEditCategoryName(e.target.value)}
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setEditingCategory(null)}>
                                        Annuler
                                      </Button>
                                      <Button
                                        onClick={updateCategory}
                                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 border-0 text-white"
                                      >
                                        Sauvegarder
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteCategory(category.id, category.name)}
                                  className="h-8 w-8 text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium mb-3 text-green-600">Revenus</h4>
                    {customCategories.filter((cat) => cat.type === "INCOME").length === 0 ? (
                      <p className="text-muted-foreground text-sm">Aucune catégorie personnalisée</p>
                    ) : (
                      <div className="space-y-2">
                        {customCategories
                          .filter((cat) => cat.type === "INCOME")
                          .map((category) => (
                            <div
                              key={category.id}
                              className="flex items-center justify-between p-3 border rounded-lg bg-white/30"
                            >
                              <Badge variant="secondary">{category.name}</Badge>
                              <div className="flex items-center space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setEditingCategory(category)
                                        setEditCategoryName(category.name)
                                      }}
                                      className="h-8 w-8 text-blue-500 hover:text-blue-700"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Modifier la catégorie</DialogTitle>
                                      <DialogDescription>
                                        Modifiez le nom de la catégorie "{category.name}"
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="editCategoryName">Nouveau nom</Label>
                                        <Input
                                          id="editCategoryName"
                                          value={editCategoryName}
                                          onChange={(e) => setEditCategoryName(e.target.value)}
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setEditingCategory(null)}>
                                        Annuler
                                      </Button>
                                      <Button
                                        onClick={updateCategory}
                                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 border-0 text-white"
                                      >
                                        Sauvegarder
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteCategory(category.id, category.name)}
                                  className="h-8 w-8 text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Gestion des budgets</span>
              </CardTitle>
              <CardDescription>Définissez et gérez vos budgets par catégorie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Ajouter un nouveau budget</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="budgetCategory">Catégorie</Label>
                    <Select value={newBudgetCategoryId} onValueChange={setNewBudgetCategoryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter((cat) => cat.type === "EXPENSE")
                          .map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="budgetAmount">Budget mensuel (€)</Label>
                    <Input
                      id="budgetAmount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={addBudget}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 border-0 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">Budgets actuels</h3>
                {uniqueBudgets.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Aucun budget défini. Ajoutez-en un pour commencer !
                  </p>
                ) : (
                  <div className="space-y-3">
                    {uniqueBudgets.map((budget) => (
                      <div key={budget.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Badge variant="secondary">{budget.category.name}</Badge>
                          <span className="font-medium">{budget.limit}€/mois</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingBudget(budget)
                                  setEditBudgetAmount(budget.limit.toString())
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Modifier le budget</DialogTitle>
                                <DialogDescription>
                                  Modifiez le budget pour la catégorie {budget.category.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="editBudgetAmount">Nouveau montant (€)</Label>
                                  <Input
                                    id="editBudgetAmount"
                                    type="number"
                                    step="0.01"
                                    value={editBudgetAmount}
                                    onChange={(e) => setEditBudgetAmount(e.target.value)}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingBudget(null)}>
                                  Annuler
                                </Button>
                                <Button
                                  onClick={updateBudget}
                                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 border-0 text-white"
                                  disabled={!editBudgetAmount || editBudgetAmount === budget.limit.toString()}
                                >
                                  Sauvegarder
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteBudget(budget.id, budget.category.name)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>Gérez vos préférences de notification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notifications de budget</Label>
                  <p className="text-sm text-muted-foreground">Recevoir des alertes en cas de dépassement</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sauvegarde automatique</Label>
                  <p className="text-sm text-muted-foreground">Sauvegarder automatiquement vos données</p>
                </div>
                <Switch checked={autoSave} onCheckedChange={setAutoSave} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Gestion des données</span>
              </CardTitle>
              <CardDescription>Exportez vos données au format Excel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                    <Button
                  onClick={exportTransactionsData}
                  variant="outline"
                  className="hover:scale-105 transition-transform bg-transparent border-green-600 text-green-600 hover:bg-green-50 
dark:hover:bg-green-900/20 
dark:border-green-400
 dark:text-green-400"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exporter Transactions Excel
                </Button>
                <Button
                  onClick={exportBudgetsData}
                  variant="outline"
                  className="hover:scale-105 transition-transform bg-transparent border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:border-blue-400 dark:text-blue-400"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exporter Budgets Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              onClick={saveSettings}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 border-0 text-white hover:scale-105 transition-transform"
            >
              <Shield className="h-4 w-4 mr-2" />
              Sauvegarder les paramètres
            </Button>
          </div>

          <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>À propos de MBONGOU</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Version 2.0.0</p>
              <p>Application de gestion de budget personnel moderne et intuitive</p>
              <p>Développée avec Next.js, React, Tailwind CSS, Supabase et Prisma</p>
              <p className="text-xs mt-4">
                💡 Conseil : Vos données sont synchronisées en temps réel et sauvegardées de manière sécurisée
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
