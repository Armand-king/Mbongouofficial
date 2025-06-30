"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, BarChart3, History, Settings, Wallet, TrendingUp, Target, Shield } from "lucide-react"
import Image from "next/image"
import Navigation from "@/components/navigation"
import Dashboard from "@/components/dashboard"
import AddTransaction from "@/components/add-transaction"
import TransactionHistory from "@/components/transaction-history"
import Statistics from "@/components/statistics"
import SettingsPage from "@/components/settings-page"
import Link from "next/link"
import ImageCarousel from "../components/ImageCarousel"

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState("home")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handlePageChange = (page: string) => {
    setCurrentPage(page)
  }

  const handleTransactionAdded = () => {
    setCurrentPage("history")
  }

  if (!mounted) {
    return null
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard key="dashboard" />
      case "add":
        return (
          <AddTransaction
            key="add"
            onBack={() => setCurrentPage("home")}
            onTransactionAdded={handleTransactionAdded}
          />
        )
      case "history":
        return <TransactionHistory key="history" />
      case "statistics":
        return <Statistics key="statistics" />
      case "settings":
        return <SettingsPage key="settings" onNavigate={handlePageChange} />
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center space-y-8 mb-12">
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg">
                      <Image
                        src="./mbongou.jpeg"
                        alt="MBONGOU"
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Mbongou.App
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    L'application moderne qui vous aide à gérer votre budget personnel avec intelligence et simplicité
                  </p>
                </div>

                {/* Hero Section corrigée */}
                <section className="relative w-full bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-24 px-4 md:px-8 lg:px-16 overflow-hidden">
                  <div className="relative z-10 max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center justify-between">
                    <div className="w-full lg:w-1/2 text-center lg:text-left">
                      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white leading-tight">
                        Prenez le contrôle <br className="hidden md:block" /> de votre budget sans effort. 😉
                      </h1>
                      <p className="mt-6 text-gray-600 dark:text-gray-300 text-lg md:text-xl">
                        Avec <strong>Mbongou.App</strong>, vous suivez vos revenus, gérez vos dépenses et atteignez vos objectifs d’épargne — tout ça dans une interface claire, intuitive et 100% sécurisée.
                      </p>

                      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                        <Link
                          href="/budgets"
                          className="btn btn-primary text-white px-6 py-3 rounded-xl shadow-md hover:scale-105 transition"
                        >
                          Commencer maintenant
                        </Link>
                      </div>
                    </div>
                    <div className="w-full lg:w-1/2 flex justify-center mb-12 lg:mb-0">
                      <ImageCarousel />
                    </div>
                  </div>
                </section>

                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 border-0 hover:scale-105 transition-transform text-white"
                    onClick={() => setCurrentPage("add")}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Ajouter une transaction
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6 hover:scale-105 transition-transform bg-transparent border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 dark:border-green-400 dark:text-green-400"
                    onClick={() => setCurrentPage("dashboard")}
                  >
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Voir le tableau de bord
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                  {
                    icon: Wallet,
                    title: "Suivi en temps réel",
                    description: "Enregistrez vos dépenses et revenus instantanément",
                    color: "text-blue-500",
                  },
                  {
                    icon: TrendingUp,
                    title: "Analyses détaillées",
                    description: "Visualisez vos habitudes financières avec des graphiques",
                    color: "text-green-500",
                  },
                  {
                    icon: Target,
                    title: "Budgets intelligents",
                    description: "Définissez et suivez vos objectifs par catégorie",
                    color: "text-purple-500",
                  },
                  {
                    icon: Shield,
                    title: "Données sécurisées",
                    description: "Vos informations restent privées et sécurisées",
                    color: "text-orange-500",
                  },
                ].map((feature, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-lg transition-shadow animate-slide-up border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                  >
                    <CardHeader className="text-center">
                      <feature.icon className={`h-12 w-12 mx-auto ${feature.color}`} />
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-center">{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <Card className="max-w-2xl mx-auto border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl">✨ Prenez le contrôle en un clic !</CardTitle>
                    <CardDescription>
🌟 Sur cette plateforme, tout est à portée de main : 📊 suivez vos activités sur le Dashboard, 📜 retrouvez vos actions passées grâce à l’Historique et ⚙️ personnalisez votre expérience dans les Paramètres. 💡 Une interface claire, fluide et pensée pour vous simplifier la vie !!!!
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-3 gap-4">
                      <Button
                        variant="outline"
                        className="hover:scale-105 transition-transform bg-transparent border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 dark:border-green-400 dark:text-green-400"
                        onClick={() => setCurrentPage("dashboard")}
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                      <Button
                        variant="outline"
                        className="hover:scale-105 transition-transform bg-transparent border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:border-blue-400 dark:text-blue-400"
                        onClick={() => setCurrentPage("history")}
                      >
                        <History className="mr-2 h-4 w-4" />
                        Historique
                      </Button>
                      <Button
                        variant="outline"
                        className="hover:scale-105 transition-transform bg-transparent border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 dark:border-purple-400 dark:text-purple-400"
                        onClick={() => setCurrentPage("settings")}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Paramètres
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage={currentPage} onPageChange={handlePageChange} />
      {renderPage()}
    </div>
  )
}
