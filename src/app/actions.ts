"use server";

import { ContentFormData, GeneratedContent, Platform } from "@/lib/types";
import { formatForPlatform } from "@/lib/platform-handlers";

// Simulate content generation by an AI
export async function generateContent(formData: ContentFormData): Promise<GeneratedContent> {
  // Add a small delay to simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate base content based on user input
  const baseContent = simulateContentGeneration(formData);
  
  // Format content for each selected platform
  const platforms: { [key in Platform]?: string } = {};
  
  Object.entries(formData.platforms).forEach(([platform, isSelected]) => {
    if (isSelected) {
      platforms[platform as Platform] = formatForPlatform(baseContent, platform as Platform);
    }
  });
  
  return {
    baseContent,
    platforms,
    timestamp: Date.now(),
  };
}

// Simulate AI content generation
function simulateContentGeneration(formData: ContentFormData): string {
  const { topic, tone, length, keywords, callToAction } = formData;
  
  // Simple templates based on tone
  const toneTemplates = {
    professional: `Dans le contexte actuel, ${topic} représente un enjeu majeur pour les professionnels. Il est essentiel de considérer les aspects suivants pour optimiser votre approche.`,
    casual: `Parlons un peu de ${topic} ! C'est un sujet qui me passionne et je voulais partager quelques réflexions avec vous.`,
    enthusiastic: `Wow ! ${topic} est absolument fascinant ! Je suis très enthousiaste de partager avec vous ces informations incroyables !`,
    informative: `À propos de ${topic} : voici quelques faits importants et analyses que vous devriez connaître pour mieux comprendre ce sujet.`,
  };
  
  // Start with the tone template
  let content = toneTemplates[tone];
  
  // Add keywords if provided
  if (keywords) {
    const keywordsList = keywords.split(",").map(k => k.trim());
    if (keywordsList.length > 0) {
      const keywordSection = keywordsList.length === 1 
        ? `Un aspect important à considérer est ${keywordsList[0]}.` 
        : `Plusieurs aspects importants à considérer incluent ${keywordsList.slice(0, -1).join(", ")} et ${keywordsList[keywordsList.length - 1]}.`;
      
      content += " " + keywordSection;
    }
  }
  
  // Add more content based on length
  const lengthParagraphs = {
    1: [
      `${topic} offre de nombreuses possibilités pour qui sait les saisir.`,
    ],
    2: [
      `${topic} offre de nombreuses possibilités pour qui sait les saisir.`,
      `Les experts s'accordent à dire que la tendance actuelle va se poursuivre dans les prochains mois.`,
    ],
    3: [
      `${topic} offre de nombreuses possibilités pour qui sait les saisir.`,
      `Les experts s'accordent à dire que la tendance actuelle va se poursuivre dans les prochains mois.`,
      `Il est important de rester informé des dernières évolutions pour adapter sa stratégie en conséquence.`,
      `Les données récentes montrent une évolution significative dans ce domaine, ce qui ouvre de nouvelles perspectives.`,
    ],
  };
  
  // Add paragraphs based on length
  lengthParagraphs[length as 1 | 2 | 3].forEach(paragraph => {
    content += "\n\n" + paragraph;
  });
  
  // Add call to action if provided
  if (callToAction) {
    content += `\n\n${callToAction}`;
  }
  
  return content;
}
