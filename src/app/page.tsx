import SocialContentGenerator from "@/components/social-content-generator";

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        ContentGen - Générateur de Contenu pour Réseaux Sociaux
      </h1>
      <SocialContentGenerator />
    </main>
  );
}
