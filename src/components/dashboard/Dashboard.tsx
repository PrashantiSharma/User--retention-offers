
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StoreOverview from '@/components/dashboard/StoreOverview';
import OfferPerformance from '@/components/dashboard/OfferPerformance';
import CustomerSegments from '@/components/dashboard/CustomerSegments';
import LearningProgress from '@/components/dashboard/LearningProgress';
import { store } from '@/data/store';

const Dashboard: React.FC = () => {
  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{store.name} Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your store's performance and AI recommendations
        </p>
      </div>
      
      <StoreOverview />
      
      <Tabs defaultValue="offers" className="w-full">
        <TabsList>
          <TabsTrigger value="offers">Offer Performance</TabsTrigger>
          <TabsTrigger value="segments">Customer Segments</TabsTrigger>
          <TabsTrigger value="learning">Learning Progress</TabsTrigger>
        </TabsList>
        <TabsContent value="offers">
          <OfferPerformance />
        </TabsContent>
        <TabsContent value="segments">
          <CustomerSegments />
        </TabsContent>
        <TabsContent value="learning">
          <LearningProgress />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
