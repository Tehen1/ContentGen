import { Platform } from "./types";

// Character limits for different platforms
export const PLATFORM_LIMITS = {
  twitter: 280,
  linkedin: 3000,
  facebook: 5000,
  instagram: 2200,
};

// Format content for different platforms
export const formatForPlatform = (content: string, platform: Platform): string => {
  const limit = PLATFORM_LIMITS[platform];
  let formatted = content;

  // Truncate content if it's too long
  if (formatted.length > limit) {
    formatted = formatted.substring(0, limit - 3) + "...";
  }

  // Platform-specific formatting
  switch (platform) {
    case "twitter":
      // Add hashtags for Twitter
      if (!formatted.includes("#")) {
        const words = formatted.split(" ");
        const potentialTags = words.filter(w => w.length > 4 && !w.includes("http"));
        if (potentialTags.length > 0) {
          const hashtag = "#" + potentialTags[Math.floor(Math.random() * potentialTags.length)].replace(/[^\w]/g, "");
          formatted = formatted + "\n\n" + hashtag;
        }
      }
      break;
    
    case "linkedin":
      // More professional format for LinkedIn
      if (!formatted.includes("---")) {
        formatted = formatted + "\n\n---\n\nQu'en pensez-vous ? Partagez vos idées dans les commentaires.";
      }
      break;
    
    case "facebook":
      // More casual for Facebook
      if (!formatted.includes("👍")) {
        formatted = formatted + "\n\n👍 Aimez et partagez si vous êtes d'accord !";
      }
      break;
    
    case "instagram":
      // Add hashtags for Instagram
      if (!formatted.includes("#")) {
        formatted = formatted + "\n\n#contenu #socialmedia #partage";
      }
      break;
    
    default:
      break;
  }

  return formatted;
};

// Get placeholder text for each platform
export const getPlaceholderForPlatform = (platform: Platform): string => {
  switch (platform) {
    case "twitter":
      return "Votre tweet sera affiché ici (max 280 caractères)";
    case "linkedin":
      return "Votre post LinkedIn professionnel sera affiché ici";
    case "facebook":
      return "Votre post Facebook sera affiché ici";
    case "instagram":
      return "Votre caption Instagram sera affichée ici";
    default:
      return "Contenu généré";
  }
};
