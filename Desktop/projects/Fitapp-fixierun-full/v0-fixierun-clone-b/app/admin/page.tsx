"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Settings,
  ImageIcon,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  Zap,
  Shield,
  BarChart3,
  FileText,
} from "lucide-react"

export default function AdminDashboard() {
  const [systemStatus, setSystemStatus] = useState({
    images: { total: 156, working: 142, errors: 14, processed: 89 },
    storage: { used: "2.3 GB", available: "7.7 GB", percentage: 23 },
    performance: { avgLoadTime: "1.2s", errorRate: "8.9%", uptime: "99.2%" },
  })

  const adminSections = [
    {
      title: "Gestion des Images",
      description: "Traitement automatique, vérification d'intégrité et correction d'erreurs",
      icon: ImageIcon,
      href: "/admin/images",
      status: "active",
      stats: `${systemStatus.images.working}/${systemStatus.images.total} images fonctionnelles`,
      color: "blue",
    },
    {
      title: "Diagnostic Système",
      description: "Vérification des URLs Blob, chemins d'images et intégrité des fichiers",
      icon: Activity,
      href: "/admin/diagnostic",
      status: "warning",
      stats: `${systemStatus.images.errors} erreurs détectées`,
      color: "yellow",
    },
    {
      title: "Base de Données",
      description: "Gestion des métadonnées NFT et synchronisation des assets",
      icon: Database,
      href: "/admin/database",
      status: "active",
      stats: "Synchronisé",
      color: "green",
    },
    {
      title: "Sécurité & Logs",
      description: "Monitoring des accès et journaux d'activité",
      icon: Shield,
      href: "/admin/security",
      status: "active",
      stats: "Aucune menace détectée",
      color: "green",
    },
    {
      title: "Analytics",
      description: "Statistiques d'utilisation et performance des images",
      icon: BarChart3,
      href: "/admin/analytics",
      status: "active",
      stats: `${systemStatus.performance.uptime} uptime`,
      color: "purple",
    },
    {
      title: "Configuration",
      description: "Paramètres globaux et configuration du traitement d'images",
      icon: Settings,
      href: "/admin/settings",
      status: "active",
      stats: "Configuration optimale",
      color: "gray",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case "error":
        return <AlertTriangle className="w-5 h-5 text-red-400" />
      default:
        return <CheckCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20",
      yellow: "border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20",
      green: "border-green-500/30 bg-green-500/10 hover:bg-green-500/20",
      purple: "border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20",
      gray: "border-gray-500/30 bg-gray-500/10 hover:bg-gray-500/20",
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  return (
    <div className="min-h-screen bg-cyberpunk-darker py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-cyber font-bold text-white mb-2 flex items-center">
                <Shield className="w-8 h-8 mr-3 text-accent" />
                Administration NFT Fixie Bikes
              </h1>
              <p className="text-gray-300 text-lg">Interface complète de gestion et maintenance du système</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-400">Dernière mise à jour</div>
                <div className="text-white font-medium">{new Date().toLocaleString("fr-FR")}</div>
              </div>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            </div>
          </div>
        </header>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 cyber-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Images Totales</p>
                <p className="text-2xl font-bold text-white">{systemStatus.images.total}</p>
              </div>
              <ImageIcon className="w-8 h-8 text-blue-400" />
            </div>
            <div className="mt-2 text-xs text-gray-500">{systemStatus.images.processed} traitées automatiquement</div>
          </div>

          <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 cyber-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Erreurs Détectées</p>
                <p className="text-2xl font-bold text-yellow-400">{systemStatus.images.errors}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="mt-2 text-xs text-gray-500">URLs Blob et chemins invalides</div>
          </div>

          <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 cyber-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Stockage Utilisé</p>
                <p className="text-2xl font-bold text-purple-400">{systemStatus.storage.used}</p>
              </div>
              <Database className="w-8 h-8 text-purple-400" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {systemStatus.storage.percentage}% de {systemStatus.storage.used} + {systemStatus.storage.available}
            </div>
          </div>

          <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 cyber-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Performance</p>
                <p className="text-2xl font-bold text-green-400">{systemStatus.performance.uptime}</p>
              </div>
              <Activity className="w-8 h-8 text-green-400" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Temps de chargement: {systemStatus.performance.avgLoadTime}
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-accent/10 border border-accent/30 rounded-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-accent" />
            Actions Rapides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/images"
              className="flex items-center space-x-3 bg-blue-500/20 text-blue-400 px-4 py-3 rounded-sm hover:bg-blue-500/30 transition-colors"
            >
              <ImageIcon className="w-5 h-5" />
              <span>Traiter Toutes les Images</span>
            </Link>
            <Link
              href="/admin/diagnostic"
              className="flex items-center space-x-3 bg-yellow-500/20 text-yellow-400 px-4 py-3 rounded-sm hover:bg-yellow-500/30 transition-colors"
            >
              <Activity className="w-5 h-5" />
              <span>Diagnostic Complet</span>
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center space-x-3 bg-purple-500/20 text-purple-400 px-4 py-3 rounded-sm hover:bg-purple-500/30 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Configuration</span>
            </Link>
          </div>
        </div>

        {/* Sections d'administration */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => {
            const Icon = section.icon
            return (
              <Link
                key={section.href}
                href={section.href}
                className={`block p-6 rounded-sm border transition-all duration-300 ${getColorClasses(section.color)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-6 h-6 text-white" />
                    <h3 className="text-lg font-bold text-white">{section.title}</h3>
                  </div>
                  {getStatusIcon(section.status)}
                </div>
                <p className="text-gray-300 text-sm mb-3">{section.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{section.stats}</span>
                  <span className="text-xs text-accent">Accéder →</span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Logs récents */}
        <div className="mt-8 bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 cyber-border">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-gray-400" />
            Activité Récente
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-700/50">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-white">Traitement automatique des images Fixie.run- terminé</span>
              </div>
              <span className="text-xs text-gray-400">Il y a 2 minutes</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700/50">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-white">14 URLs Blob Storage détectées comme inaccessibles</span>
              </div>
              <span className="text-xs text-gray-400">Il y a 5 minutes</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700/50">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-white">Vérification d'intégrité des images terminée</span>
              </div>
              <span className="text-xs text-gray-400">Il y a 10 minutes</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-white">Mise à jour automatique des chemins d'images</span>
              </div>
              <span className="text-xs text-gray-400">Il y a 15 minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
