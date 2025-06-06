"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface CyclingActivity {
  "Location Timeline": string
  Cycling: string
  [key: string]: string // Pour les dates comme "Jun 21", "Jul 3", etc.
  From: string
  To: string
}

interface CyclingActivityListProps {
  cyclingData: CyclingActivity[]
}

export function CyclingActivityList({ cyclingData }: CyclingActivityListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filtrer les données en fonction du terme de recherche
  const filteredData = cyclingData.filter((activity) => {
    return (
      activity.Cycling.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.keys(activity)
        .filter((key) => key !== "Location Timeline" && key !== "Cycling" && key !== "From" && key !== "To")
        .some((dateKey) => activity[dateKey].toLowerCase().includes(searchTerm.toLowerCase())) ||
      activity.From.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.To.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  // Obtenir les données pour la page actuelle
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Obtenir les en-têtes de date uniques (Jun 21, Jul 3, etc.)
  const dateHeaders = Array.from(
    new Set(
      cyclingData.flatMap((activity) =>
        Object.keys(activity).filter(
          (key) => key !== "Location Timeline" && key !== "Cycling" && key !== "From" && key !== "To",
        ),
      ),
    ),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher des activités..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Distance</TableHead>
              {dateHeaders.length > 0 && <TableHead>Date</TableHead>}
              <TableHead>De</TableHead>
              <TableHead>À</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((activity, index) => {
                // Trouver la clé de date pour cette activité
                const dateKey = Object.keys(activity).find(
                  (key) => key !== "Location Timeline" && key !== "Cycling" && key !== "From" && key !== "To",
                )

                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{activity.Cycling}</TableCell>
                    {dateHeaders.length > 0 && <TableCell>{dateKey ? activity[dateKey] : ""}</TableCell>}
                    <TableCell>{activity.From}</TableCell>
                    <TableCell>{activity.To}</TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Aucune activité trouvée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Précédent
          </Button>
          <div className="text-sm">
            Page {currentPage} sur {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  )
}
