"use client";

import { useState } from "react";
import { generateContent } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Calendar, Check, Copy, Facebook, Instagram, Linkedin, Send, Twitter } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { ContentFormData, GeneratedContent, Platform } from "@/lib/types";
import { useRateLimiter } from "@/lib/rate-limiter";

export default function SocialContentGenerator() {
  // State for form data
  const [formData, setFormData] = useState<ContentFormData>({
    topic: "",
    tone: "professional",
    length: 2, // Medium
    keywords: "",
    callToAction: "",
    platforms: {
      linkedin: true,
      twitter: true,
      facebook: false,
      instagram: false,
    },
  });

  // State for generated content
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  
  // State for loading
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Rate limiter hook
  const { canGenerate, tokensRemaining, resetTime } = useRateLimiter();
  
  // Handle form input changes
  const handleInputChange = (field: string, value: string | number | boolean | object) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  // Handle platform selection
  const handlePlatformChange = (platform: Platform, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      platforms: {
        ...prev.platforms,
        [platform]: checked,
      },
    }));
  };
  
  // Handle content generation
  const handleGenerateContent = async () => {
    if (!canGenerate) return;
    
    setIsGenerating(true);
    
    try {
      // Call the server action to generate content
      const result = await generateContent(formData);
      setGeneratedContent(result);
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Function to schedule content (to be implemented)
  const scheduleContent = () => {
    alert("Fonctionnalité de planification à implémenter");
  };
  
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Form card */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration du Contenu</CardTitle>
          <CardDescription>
            Définissez les paramètres pour générer du contenu adapté à vos besoins.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Form fields will go here */}
          <div className="space-y-2">
            <label htmlFor="topic" className="text-sm font-medium">
              Sujet
            </label>
            <Input
              id="topic"
              placeholder="Ex: Intelligence Artificielle, Marketing Digital..."
              value={formData.topic}
              onChange={(e) => handleInputChange("topic", e.target.value)}
            />
          </div>
          
          {/* Add more form fields based on the ContentFormData type */}
          
          {/* Platform selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Plateformes</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="linkedin"
                  checked={formData.platforms.linkedin}
                  onCheckedChange={(checked) => handlePlatformChange("linkedin", checked as boolean)}
                />
                <label htmlFor="linkedin" className="flex items-center">
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="twitter"
                  checked={formData.platforms.twitter}
                  onCheckedChange={(checked) => handlePlatformChange("twitter", checked as boolean)}
                />
                <label htmlFor="twitter" className="flex items-center">
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter/X
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="facebook"
                  checked={formData.platforms.facebook}
                  onCheckedChange={(checked) => handlePlatformChange("facebook", checked as boolean)}
                />
                <label htmlFor="facebook" className="flex items-center">
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="instagram"
                  checked={formData.platforms.instagram}
                  onCheckedChange={(checked) => handlePlatformChange("instagram", checked as boolean)}
                />
                <label htmlFor="instagram" className="flex items-center">
                  <Instagram className="w-4 h-4 mr-2" />
                  Instagram
                </label>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Tokens restants: {tokensRemaining}
          </div>
          <Button
            onClick={handleGenerateContent}
            disabled={!canGenerate || isGenerating || !formData.topic}
          >
            {isGenerating ? "Génération..." : "Générer le Contenu"}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Results card */}
      <Card>
        <CardHeader>
          <CardTitle>Contenu Généré</CardTitle>
          <CardDescription>
            Votre contenu sera adapté pour chaque plateforme sélectionnée.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!generatedContent ? (
            <div className="flex items-center justify-center h-64 border rounded-md border-dashed">
              <p className="text-muted-foreground">
                Configurez et générez du contenu pour le voir ici.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Content for each platform would be displayed here */}
              {/* This is a placeholder implementation */}
              {Object.entries(generatedContent.platforms).map(([platform, content]) => (
                <div key={platform} className="border rounded-md p-4">
                  <div className="flex items-center mb-2">
                    {platform === "linkedin" && <Linkedin className="w-5 h-5 mr-2" />}
                    {platform === "twitter" && <Twitter className="w-5 h-5 mr-2" />}
                    {platform === "facebook" && <Facebook className="w-5 h-5 mr-2" />}
                    {platform === "instagram" && <Instagram className="w-5 h-5 mr-2" />}
                    <h3 className="font-medium capitalize">{platform}</h3>
                  </div>
                  <Textarea
                    className="min-h-[100px]"
                    value={content}
                    onChange={(e) => {
                      // Implementation to edit content would go here
                    }}
                  />
                  <div className="flex mt-2 gap-2">
                    <Button variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      Copier
                    </Button>
                    <Button variant="outline" size="sm" onClick={scheduleContent}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Planifier
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
