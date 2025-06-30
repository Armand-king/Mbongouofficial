"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  UserPlus,
  Plus,
  History,
  Settings,
  BarChart3,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Info,
  Lightbulb,
} from "lucide-react"

interface HowToPageProps {
  onPageChange: (page: string) => void
}

export default function HowToPage({ onPageChange }: HowToPageProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()

  const steps = [
    {
      id: 1,
      title: "S'inscrire ou se connecter",
      icon: UserPlus,
      description: "Créez votre compte ou connectez-vous pour accéder à la plateforme",
      details: [
        "Cliquez sur 'S'inscrire' si vous êtes nouveau sur  Mbongou.App",
        "Remplissez vos informations : nom, email et mot de passe",
        "Veuillez consulter votre boîte mail afin de confirmer votre adresse e-mail si nécessaire,",
        "Ou connectez-vous avec vos identifiants existants",
      ],
      tips: "Utilisez un mot de passe sécurisé d'au moins 6 caractères",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      id: 2,
      title: "Créer des catégories et budgets",
      icon: Settings,
      description: "Personnalisez vos catégories et définissez vos budgets",
      details: [
        "Allez dans 'Paramètres' puis 'Gestion des catégories'",
        "Créez de nouvelles catégories personnalisées",
        "Choisissez le type : Revenu ou Dépense",
        "Donnez un nom explicite à votre catégorie",
        "Dans 'Gestion des budgets', sélectionnez une catégorie de dépense",
        "Définissez un montant limite mensuel pour cette catégorie",
      ],
      tips: "Créez des catégories spécifiques à vos habitudes de consommation",
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      id: 3,
      title: "Ajouter des transactions",
      icon: Plus,
      description: "Enregistrez vos revenus et dépenses au quotidien",
      details: [
        "Cliquez sur le bouton 'Ajouter une transaction' ou l'icône '+'",
        "Choisissez le type : Revenu ou Dépense",
        "Saisissez le montant en Francs CFA",
        "Sélectionnez une catégorie appropriée",
        "Ajoutez une description (optionnel) et la date",
        "Validez en cliquant sur 'Ajouter la transaction'",
      ],
      tips: "Enregistrez vos transactions dès que possible pour ne rien oublier",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      id: 4,
      title: "Consulter l'historique",
      icon: History,
      description: "Visualisez toutes vos transactions passées",
      details: [
        "Accédez à la section 'Historique' depuis le menu",
        "Utilisez les filtres pour rechercher des transactions spécifiques",
        "Filtrez par type (revenus/dépenses), catégorie ou période",
        "Modifiez ou supprimez des transactions si nécessaire",
        "Exportez vos données au format Excel",
      ],
      tips: "Utilisez la barre de recherche pour retrouver rapidement une transaction",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
        {
      id: 5,
      title: "Consulter le dashboard",
      icon: BarChart3,
      description: "Obtenez une vue d'ensemble de vos finances",
      details: [
        "Accédez au 'Dashboard' depuis le menu principal",
        "Consultez vos revenus, dépenses et solde du mois",
        "Visualisez la répartition de vos dépenses par catégorie",
        "Suivez la progression de vos budgets en temps réel",
        "Identifiez les dépassements de budget avec les alertes",
        "Utilisez les actions rapides pour naviguer facilement",
      ],
      tips: "Consultez régulièrement votre dashboard pour rester informé de votre situation financière",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      id: 6,
      title: "Consulter les statistiques",
      icon: TrendingUp,
      description: "Analysez vos habitudes financières en détail",
      details: [
        "Rendez-vous dans la section 'Statistiques'",
        "Sélectionnez l'année à analyser",
        "Consultez votre taux d'épargne et vos moyennes mensuelles",
        "Analysez l'évolution mensuelle avec les graphiques",
        "Identifiez vos principales catégories de dépenses",
        "Lisez les conseils personnalisés basés sur vos données",
      ],
      tips: "Utilisez les statistiques pour identifier des tendances et améliorer votre gestion financière",
      color: "text-pink-500",
      bgColor: "bg-pink-50 dark:bg-pink-900/20",
    },
  ]

  const CurrentStepIcon = steps[currentStep].icon
  const CurrentStepTitle = steps[currentStep].title
  const CurrentStepDescription = steps[currentStep].description
  const CurrentStepDetails = steps[currentStep].details
  const CurrentStepTips = steps[currentStep].tips
  const CurrentStepColor = steps[currentStep].color
  const CurrentStepBgColor = steps[currentStep].bgColor

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* En-tête */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Comment utiliser  Mbongou.App ?
            </h1>
            <p className="text-muted-foreground text-lg">
              Suivez ces 6 étapes simples pour maîtriser votre budget personnel
            </p>
          </div>

          {/* Navigation des étapes */}
          <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5" />
                <span>Étapes à suivre</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {steps.map((step, index) => (
                  <Button
                    key={step.id}
                    variant={currentStep === index ? "default" : "outline"}
                    className={`h-auto flex-col space-y-2 p-4 ${
                      currentStep === index
                        ? "bg-gradient-to-r from-green-600 to-blue-600 text-white border-0"
                        : "bg-transparent hover:scale-105 transition-transform"
                    }`}
                    onClick={() => setCurrentStep(index)}
                  >
                    <step.icon className="h-6 w-6" />
                    <span className="text-xs text-center">Étape {step.id}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Détail de l'étape sélectionnée */}
          <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${CurrentStepBgColor}`}>
                  <CurrentStepIcon className={`h-8 w-8 ${CurrentStepColor}`} />
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    <Badge variant="secondary" className="mr-3">
                      Étape {steps[currentStep].id}
                    </Badge>
                    {CurrentStepTitle}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {CurrentStepDescription}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">
                  Instructions détaillées :
                </h3>
                <div className="space-y-3">
                  {CurrentStepDetails.map((detail, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-4 rounded-lg ${CurrentStepBgColor}`}>
                <div className="flex items-start space-x-3">
                  <Lightbulb className={`h-5 w-5 ${CurrentStepColor} mt-0.5 flex-shrink-0`} />
                  <div>
                    <h4 className="font-medium">Conseil :</h4>
                    <p className="text-sm text-muted-foreground">
                      {CurrentStepTips}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="bg-transparent"
                >
                  Étape précédente
                </Button>
                <Button
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  disabled={currentStep === steps.length - 1}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 border-0 text-white"
                >
                  Étape suivante
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Vue d'ensemble */}
          <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Vue d'ensemble du processus</CardTitle>
              <CardDescription>Toutes les étapes en un coup d'œil</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-4 p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
                      currentStep === index ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "hover:bg-accent"
                    }`}
                    onClick={() => setCurrentStep(index)}
                  >
                    <div className={`p-2 rounded-full ${step.bgColor}`}>
                      <step.icon className={`h-5 w-5 ${step.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">
                        Étape {step.id}: {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                    {currentStep === index && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Conseils généraux */}
          <Card className="border-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <span>Conseils pour bien commencer</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-green-600">✅ Bonnes pratiques</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Enregistrez vos transactions quotidiennement</li>
                    <li>• Définissez des budgets réalistes</li>
                    <li>• Consultez régulièrement votre dashboard</li>
                    <li>• Utilisez des catégories spécifiques</li>
                    <li>• Exportez vos données régulièrement</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-orange-600">⚠️ À éviter</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Oublier d'enregistrer des transactions</li>
                    <li>• Créer trop de catégories similaires</li>
                    <li>• Ignorer les alertes de dépassement</li>
                    <li>• Ne pas consulter les statistiques</li>
                    <li>• Définir des budgets irréalistes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to action */}
          <div className="text-center">
            <Card className="border-0 bg-gradient-to-r from-green-600 to-blue-600 text-white">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Prêt à commencer ?</h2>
                <p className="mb-6">
                  Vous avez maintenant toutes les clés en main pour gérer efficacement votre budget avec  Mbongou.App !
                </p>
                <Button
                  size="lg"
                  variant="secondary"
                  className="hover:scale-105 transition-transform"
                  onClick={() => onPageChange("settings")}
                >
                  On y va en ensemble!
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
