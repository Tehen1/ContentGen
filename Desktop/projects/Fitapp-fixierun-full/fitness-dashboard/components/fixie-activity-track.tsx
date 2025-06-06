"use client";

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export default function FixieActivityTrack() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('embedded');
  const { toast } = useToast();

  useEffect(() => {
    const handleIframeLoad = () => {
      setIsLoaded(true);
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoad);
      }
    };
  }, []);

  const handleSendData = () => {
    if (!iframeRef.current) return;
    
    try {
      // Get activities from localStorage or state
      const activities = localStorage.getItem('fitnessActivities');
      
      if (!activities) {
        toast({
          title: "No data available",
          description: "There is no activity data to send to Fixie",
          variant: "destructive",
        });
        return;
      }
      
      // Send data to iframe using postMessage
      iframeRef.current.contentWindow?.postMessage({
        type: 'IMPORT_ACTIVITIES',
        data: JSON.parse(activities)
      }, '*');
      
      toast({
        title: "Data sent",
        description: "Activity data has been sent to Fixie Activity Track",
      });
    } catch (error) {
      console.error('Error sending data to iframe:', error);
      toast({
        title: "Error",
        description: "Failed to send data to Fixie Activity Track",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Fixie Activity Track</CardTitle>
        <CardDescription>
          Interactive visualization of your activity data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="embedded" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="embedded">Embedded View</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="embedded" className="relative">
            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p>Loading Fixie Activity Track...</p>
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-lg overflow-hidden h-[600px]">
              <iframe 
                ref={iframeRef}
                src="/Fixie.run-Activity-Track.html" 
                title="Fixie Activity Track" 
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts allow-forms"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Data Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Send your activity data to the Fixie Activity Track visualization
                </p>
                <Button onClick={handleSendData}>
                  Send Data to Fixie
                </Button>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">About Fixie Activity Track</h3>
                <p className="text-sm text-muted-foreground">
                  Fixie Activity Track provides advanced visualization and analysis of your
                  fitness activities. It integrates with your imported history data to show
                  patterns, trends, and insights about your fitness journey.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
