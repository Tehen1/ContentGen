// app/page.tsx
import HeroSection from "@/components/hero-section"
import BikeShowcase from "@/components/bike-showcase"
import FaqSection from "@/components/faq-section"
// import ThemeDemo from "@/components/theme-demo"; // Si vous l'utilisez, gardez-le
import SimpleNFTShowcase from "@/components/nft/simple-nft-showcase"
// Assurez-vous que les autres imports de section sont là si nécessaire

export default function Home() {
  return (
    <>
      {/* Scanline effect - si vous le voulez sur la page d'accueil uniquement */}
      {/* <div className="scanline" aria-hidden="true"></div> */}
      <HeroSection />
      {/* Features Section - comme dans votre code existant */}
      <section id="features" className="py-16 md:py-24 relative overflow-hidden themed-section">
        {/* ... contenu de la section Features ... */}
        {/* (Je vais reprendre le contenu de votre fichier app/page.tsx existant pour cette section) */}
        <div className="absolute inset-0 bg-cyber-grid z-0 opacity-40"></div>
        <div className="absolute inset-0 z-0 themed-bg"></div>
        <div className="container mx-auto px-4 relative z-10">
          <header className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-cyber font-bold mb-4">
              <span className="themed-heading">Revolutionary</span>{" "}
              <span className="cyber-text themed-subheading">Features</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Fixie.Run revolutionizes fitness by combining real-world cycling with blockchain technology and rewards.
            </p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: GPS Activity Tracking */}
            <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 shadow-lg cyber-border card-glow">
              {/* ... contenu ... */}
            </div>
            {/* Feature 2: Crypto Rewards */}
            <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 shadow-lg cyber-border card-glow">
              {/* ... contenu ... */}
            </div>
            {/* Feature 3: Evolving NFT Bikes */}
            <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 shadow-lg cyber-border card-glow">
              {/* ... contenu ... */}
            </div>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 4: Zero-Knowledge Verification */}
            <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 shadow-lg cyber-border">
              {/* ... contenu ... */}
            </div>
            {/* Feature 5: Social Fitness */}
            <div className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm p-6 shadow-lg cyber-border">
              {/* ... contenu ... */}
            </div>
          </div>
        </div>
      </section>
      <BikeShowcase /> {/* "NFT Fixie Bikes" & "Premium NFT Collection" */}
      {/* La section "Featured NFT Fixie Bikes" pourrait être BikeGallery ou une partie de SimpleNFTShowcase */}
      <SimpleNFTShowcase /> {/* Ou BikeGallery pour "Featured NFT Fixie Bikes" */}
      {/* <BikeGallery /> */}
      <FaqSection />
      {/* <ThemeDemo />  S'il est utilisé pour le sélecteur de thème en bas, sinon il est dans AccessibilityPanel */}
    </>
  )
}
