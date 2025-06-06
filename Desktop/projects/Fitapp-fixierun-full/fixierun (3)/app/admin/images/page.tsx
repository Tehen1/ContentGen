import ImageDiagnostic from "@/components/admin/image-diagnostic"
import AdvancedImageProcessorAdmin from "@/components/admin/advanced-image-processor"

export default function AdminImagesPage() {
  return (
    <div className="min-h-screen bg-cyberpunk-darker py-8">
      <div className="container mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-4xl font-cyber font-bold text-white mb-2">
            🎨 Administration des Images NFT Fixie Bikes
          </h1>
          <p className="text-gray-300 text-lg">
            Interface complète pour traiter, optimiser et gérer toutes les images du projet
          </p>
        </header>

        <div className="space-y-8">
          {/* Processeur principal */}
          <div>
            <h2 className="text-2xl font-cyber font-bold text-white mb-4 flex items-center">
              <span className="mr-2">⚡</span>
              Processeur Automatique Avancé
            </h2>
            <AdvancedImageProcessorAdmin />
          </div>

          {/* Diagnostic */}
          <div>
            <h2 className="text-2xl font-cyber font-bold text-white mb-4 flex items-center">
              <span className="mr-2">🔍</span>
              Diagnostic des Images
            </h2>
            <ImageDiagnostic />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-sm p-6">
          <h3 className="text-xl font-bold text-blue-400 mb-3">📋 Instructions d'utilisation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-bold text-white mb-2">Traitement automatique :</h4>
              <ul className="space-y-1">
                <li>• Cliquez sur "Options" pour configurer le traitement</li>
                <li>• Activez/désactivez les filtres selon vos besoins</li>
                <li>• Cliquez sur "Démarrer" pour lancer le traitement</li>
                <li>• Utilisez "Pause" pour interrompre temporairement</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">Fonctionnalités :</h4>
              <ul className="space-y-1">
                <li>• Suppression automatique des arrière-plans</li>
                <li>• Filtres cyberpunk pour l'esthétique</li>
                <li>• Effets de lueur personnalisables</li>
                <li>• Optimisation et compression des images</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
