"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Plus,
  Minus,
  ShoppingCart,
  Car,
  Utensils,
  Gamepad2,
  Home,
  GraduationCap,
  Heart,
  Gift,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

interface AddTransactionProps {
  onBack: () => void
  onTransactionAdded?: () => void
}

interface Category {
  id: string
  name: string
  type: "INCOME" | "EXPENSE"
}

export default function AddTransaction({ onBack, onTransactionAdded }: AddTransactionProps) {
  const [type, setType] = useState<"income" | "expense">("expense")
  const [amount, setAmount] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!amount || !categoryId || !date) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          amount: Number.parseFloat(amount),
          categoryId,
          description,
          date,
        }),
      })

      if (response.ok) {
        toast({
          title: "Transaction ajoutée !",
          description: `${type === "income" ? "Revenu" : "Dépense"} de ${amount}  Frcfa enregistré(e)`,
        })

        // Reset form
        setAmount("")
        setCategoryId("")
        setDescription("")
        setDate(new Date().toISOString().split("T")[0])

        // Redirect to history after showing toast
        setTimeout(() => {
          if (onTransactionAdded) {
            onTransactionAdded()
          }
        }, 1000)
      } else {
        throw new Error("Failed to create transaction")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la transaction",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter((cat) => cat.type === type.toUpperCase())

  const getIconForCategory = (categoryName: string) => {
    const iconMap: { [key: string]: any } = {
      Alimentation: Utensils,
      Transport: Car,
      Loisirs: Gamepad2,
      Shopping: ShoppingCart,
      Logement: Home,
      Éducation: GraduationCap,
      Santé: Heart,
      Cadeaux: Gift,
    }
    return iconMap[categoryName] || ShoppingCart
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* En-tête */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack} className="hover:scale-105 transition-transform">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Ajouter une transaction</h1>
              <p className="text-muted-foreground">Enregistrez vos revenus et dépenses</p>
            </div>
          </div>

          <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Nouvelle transaction</CardTitle>
              <CardDescription>Remplissez les informations de votre transaction</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type de transaction */}
                <div className="space-y-3">
                  <Label>Type de transaction</Label>
                  <RadioGroup value={type} onValueChange={(value) => setType(value as "income" | "expense")}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent transition-colors">
                        <RadioGroupItem value="expense" id="expense" />
                        <Label htmlFor="expense" className="flex items-center space-x-2 cursor-pointer">
                          <Minus className="h-4 w-4 text-red-500" />
                          <span>Dépense</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent transition-colors">
                        <RadioGroupItem value="income" id="income" />
                        <Label htmlFor="income" className="flex items-center space-x-2 cursor-pointer">
                          <Plus className="h-4 w-4 text-green-500" />
                          <span>Revenu</span>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Montant */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Montant (  Frcfa) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="Exemple: 1520000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-lg"
                  />
                </div>

                {/* Catégorie */}
                <div className="space-y-2">
                  <Label>Catégorie *</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <Textarea
                    id="description"
                    placeholder="Ajoutez une note sur cette transaction..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Boutons */}
                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    className="flex-1 gradient-bg border-0 hover:scale-105 transition-transform"
                    disabled={loading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {loading ? "Ajout en cours..." : "Ajouter la transaction"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    className="hover:scale-105 transition-transform bg-transparent"
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Conseils */}
          <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">💡 Conseils</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Enregistrez vos transactions dès que possible pour ne rien oublier</p>
              <p>• Utilisez des descriptions claires pour retrouver facilement vos dépenses</p>
              <p>• Vérifiez régulièrement vos budgets pour éviter les dépassements</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
