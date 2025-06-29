import * as XLSX from "xlsx"

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

export function exportTransactionsToExcel(transactions: Transaction[], filename?: string) {
  // Préparer les données pour Excel
  const excelData = transactions.map((transaction, index) => ({
    "N°": index + 1,
    Date: new Date(transaction.date).toLocaleDateString("fr-FR"),
    Type: transaction.type === "INCOME" ? "Revenu" : "Dépense",
    Catégorie: transaction.category.name,
    "Montant (€)": transaction.amount,
    Description: transaction.description || "",
  }))

  // Créer un nouveau workbook
  const workbook = XLSX.utils.book_new()

  // Créer une feuille de calcul
  const worksheet = XLSX.utils.json_to_sheet(excelData)

  // Définir la largeur des colonnes
  const columnWidths = [
    { wch: 5 }, // N°
    { wch: 12 }, // Date
    { wch: 10 }, // Type
    { wch: 15 }, // Catégorie
    { wch: 12 }, // Montant
    { wch: 30 }, // Description
  ]
  worksheet["!cols"] = columnWidths

  // Ajouter des styles aux en-têtes
  const headerStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: "E8F5E8" } },
    alignment: { horizontal: "center" },
  }

  // Appliquer le style aux en-têtes (première ligne)
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1")
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
    if (!worksheet[cellAddress]) continue
    worksheet[cellAddress].s = headerStyle
  }

  // Ajouter la feuille au workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions")

  // Créer une feuille de résumé
  const totalIncome = transactions.filter((t) => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions.filter((t) => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0)

  const summaryData = [
    { Résumé: "Total Revenus", "Montant (€)": totalIncome },
    { Résumé: "Total Dépenses", "Montant (€)": totalExpenses },
    { Résumé: "Solde", "Montant (€)": totalIncome - totalExpenses },
    { Résumé: "", "Montant (€)": "" },
    { Résumé: "Nombre de transactions", "Montant (€)": transactions.length },
    { Résumé: "Période", "Montant (€)": `${new Date().toLocaleDateString("fr-FR")}` },
  ]

  const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData)
  summaryWorksheet["!cols"] = [{ wch: 20 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Résumé")

  // Générer le nom de fichier
  const defaultFilename = `transactions_mbongou_${new Date().toISOString().split("T")[0]}.xlsx`
  const finalFilename = filename || defaultFilename

  // Télécharger le fichier
  XLSX.writeFile(workbook, finalFilename)

  return finalFilename
}

export function exportBudgetsToExcel(budgets: any[], filename?: string) {
  const excelData = budgets.map((budget, index) => ({
    "N°": index + 1,
    Catégorie: budget.category.name,
    "Budget (€)": budget.limit,
    "Dépensé (€)": budget.spent,
    "Restant (€)": budget.limit - budget.spent,
    "Pourcentage utilisé": `${((budget.spent / budget.limit) * 100).toFixed(1)}%`,
    Statut: budget.spent > budget.limit ? "Dépassé" : "Dans les limites",
  }))

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(excelData)

  worksheet["!cols"] = [
    { wch: 5 }, // N°
    { wch: 15 }, // Catégorie
    { wch: 12 }, // Budget
    { wch: 12 }, // Dépensé
    { wch: 12 }, // Restant
    { wch: 18 }, // Pourcentage
    { wch: 15 }, // Statut
  ]

  XLSX.utils.book_append_sheet(workbook, worksheet, "Budgets")

  const defaultFilename = `budgets_mbongou_${new Date().toISOString().split("T")[0]}.xlsx`
  const finalFilename = filename || defaultFilename

  XLSX.writeFile(workbook, finalFilename)

  return finalFilename
}
