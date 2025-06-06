"use client";

import cyclingData from '../lib/cyclingData.json';
import type { Activity } from '../lib/types';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardShell } from "@/components/dashboard-shell";
import { DashboardHeader } from "@/components/dashboard-header";
import { ActivityFeed } from "@/components/activity-feed";
import { StatsCards } from "@/components/stats-cards";
import { UpcomingGoals } from "@/components/upcoming-goals";
import { FriendActivity } from "@/components/friend-activity";
import { HistoryFileUploader } from '@/components/history-file-uploader';
import { initializeActivities } from '@/lib/activity-data';
import { useToast } from '@/hooks/use-toast';
import FixieActivityTrack from '@/components/fixie-activity-track';
import ActivityChart from '@/components/activity-chart';

export default function DashboardPage() {
  const [isImporting, setIsImporting] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showFixieTrack, setShowFixieTrack] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize with default data
    initializeActivities();
    setIsDataLoaded(true);
  }, []);

  const handleHistoryFileLoaded = (data: any) => {
    setIsImporting(true);
    
    try {
      // Store the imported data in localStorage for easier access
      localStorage.setItem('importedHistoryData', JSON.stringify(data));
      localStorage.setItem('fitnessActivities', JSON.stringify(data));
      
      // Initialize activities with the new data
      initializeActivities();
      
      toast({
        title: "Success",
        description: "History data imported successfully!",
      });
      
      // Force a re-render
      setIsDataLoaded(false);
      setTimeout(() => {
        setIsDataLoaded(true);
        setShowFixieTrack(true);
      }, 100);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "Could not process the imported data",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Track your fitness activities and progress." />
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Import Your Activity History</CardTitle>
          <CardDescription>
            Upload your history.json file to visualize your fitness activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HistoryFileUploader onFileLoaded={handleHistoryFileLoaded} />
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCards />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <div className="col-span-4">
          <ActivityChart data={cyclingData
            .filter((activity) => activity.distance_km !== undefined && activity.distance_km > 0)
            .map((activity) => ({
              date: new Date(activity.start_time).toLocaleDateString(),
              distance: activity.distance_km!
            }))} />
        </div>
        <div className="col-span-3">
          <UpcomingGoals />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <div className="col-span-4">
          <ActivityFeed />
        </div>
        <div className="col-span-3">
          <FriendActivity />
        </div>
      </div>
      
      {/* Conditionally show the Fixie Activity Track after data is imported */}
      {(showFixieTrack || isDataLoaded) && (
        <div className="mt-6">
          <FixieActivityTrack />
        </div>
      )}
    </DashboardShell>
  );
}
