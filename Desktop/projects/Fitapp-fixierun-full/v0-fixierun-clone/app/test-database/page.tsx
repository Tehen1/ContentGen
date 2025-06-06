"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createComment, getRecentComments, createUser, getUserByWallet } from "@/app/actions/database-actions"
import { useWeb3 } from "@/lib/web3/web3-provider"
import { Loader2 } from "lucide-react"

export default function TestDatabasePage() {
  const [comment, setComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [comments, setComments] = useState<any[]>([])
  const { account, isConnected, connect } = useWeb3()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return

    setIsLoading(true)
    setMessage("")

    try {
      // Vérifier si l'utilisateur existe, sinon le créer
      let userResult = await getUserByWallet(account)

      if (!userResult.success || !userResult.data) {
        // Créer l'utilisateur
        userResult = await createUser(account)
        if (!userResult.success) {
          throw new Error("Impossible de créer l'utilisateur")
        }
      }

      // Créer le commentaire
      const result = await createComment(userResult.data.id, comment)

      if (result.success) {
        setMessage("Commentaire ajouté avec succès !")
        setComment("")
        // Recharger les commentaires
        await loadComments()
      } else {
        setMessage("Erreur : " + result.error)
      }
    } catch (error) {
      setMessage("Erreur lors de l'ajout du commentaire")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadComments = async () => {
    const result = await getRecentComments(5)
    if (result.success) {
      setComments(result.data)
    }
  }

  // Charger les commentaires au montage
  useState(() => {
    loadComments()
  })

  if (!isConnected) {
    return (
      <div className="container mx-auto p-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Connexion Requise</CardTitle>
            <CardDescription>Connectez votre portefeuille pour tester la base de données</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={connect} className="w-full">
              Connecter le Portefeuille
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Test de la Base de Données Neon</CardTitle>
            <CardDescription>Testez l'intégration avec la base de données en ajoutant un commentaire</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="comment" className="text-sm font-medium">
                  Votre commentaire
                </label>
                <Input
                  id="comment"
                  type="text"
                  placeholder="Écrivez un commentaire..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" disabled={isLoading || !comment.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer le commentaire"
                )}
              </Button>

              {message && (
                <p className={`text-sm ${message.includes("succès") ? "text-green-600" : "text-red-600"}`}>{message}</p>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commentaires Récents</CardTitle>
            <CardDescription>Les 5 derniers commentaires de la communauté</CardDescription>
          </CardHeader>
          <CardContent>
            {comments.length === 0 ? (
              <p className="text-muted-foreground">Aucun commentaire pour le moment</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b pb-3 last:border-0">
                    <p className="text-sm font-medium">
                      {comment.username ||
                        `${comment.wallet_address.slice(0, 6)}...${comment.wallet_address.slice(-4)}`}
                    </p>
                    <p className="text-sm text-muted-foreground">{comment.comment}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(comment.created_at).toLocaleString("fr-FR")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations de Connexion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Adresse du portefeuille :</strong> {account}
              </p>
              <p>
                <strong>Statut :</strong> Connecté
              </p>
              <p>
                <strong>Base de données :</strong> Neon PostgreSQL
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
