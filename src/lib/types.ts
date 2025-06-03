// Type pour les plateformes supportées
export type Platform = "linkedin" | "twitter" | "facebook" | "instagram";

// Données du formulaire de contenu
export interface ContentFormData {
  topic: string;
  tone: "professional" | "casual" | "enthusiastic" | "informative";
  length: number; // 1 = court, 2 = moyen, 3 = long
  keywords: string;
  callToAction: string;
  platforms: {
    [key in Platform]: boolean;
  };
}

// Contenu généré pour chaque plateforme
export interface GeneratedContent {
  platforms: {
    [key in Platform]?: string;
  };
  baseContent: string;
  timestamp: number;
}

// Type pour le planificateur de publication
export interface ScheduledPost {
  id: string;
  content: string;
  platform: Platform;
  scheduledTime: number;
  status: "pending" | "published" | "failed";
}

// Type pour le limiteur de taux
export interface RateLimiterState {
  tokens: number;
  lastReset: number;
}
