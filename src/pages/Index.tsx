import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ShopifyAuth from '@/components/auth/ShopifyAuth';
import GoalSelector, { BusinessGoal } from '@/components/goals/GoalSelector';
import OfferManager, { Offer, Channel } from '@/components/offers/OfferManager';
import OfferPage from '@/components/offers/OfferPage';
import Dashboard from '@/components/dashboard/Dashboard';
import { offers, channels } from '@/data/offers';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ChannelStatus from '@/components/channels/ChannelStatus';
import { Settings } from 'lucide-react';
import ChannelIntegrationManager from '@/components/channels/ChannelIntegrationManager';

const Index = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentBusinessGoal, setCurrentBusinessGoal] = useState<BusinessGoal | undefined>();
  const [currentOffers, setCurrentOffers] = useState<Offer[]>(offers as Offer[]);
  const [currentChannels, setCurrentChannels] = useState<Channel[]>(channels as Channel[]);
  const [activeTab, setActiveTab] = useState<string>("connect");
  const [userId, setUserId] = useState<string>('user123');

  const handleConnect = (shopUrl: string) => {
    setIsConnecting(true);
    
    // Simulate API connection
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
      setActiveTab("goal");
      
      toast({
        title: "Store connected successfully",
        description: `Connected to ${shopUrl}`,
      });
    }, 1500);
  };
  
  const handleGoalSelected = (goal: BusinessGoal) => {
    setCurrentBusinessGoal(goal);
    setActiveTab("offers");
    
    toast({
      title: "Business goal set",
      description: "Your goal has been updated successfully.",
    });
  };
  
  const handleOffersUpdated = (offers: any[]) => {
    setCurrentOffers(offers);
  };
  
  const handleChannelsUpdated = (channels: any[]) => {
    setCurrentChannels(channels);
  };

  const handleStartLearning = () => {
    setActiveTab("dashboard");
    
    toast({
      title: "AI agent activated",
      description: "The reinforcement learning model is now optimizing your offers.",
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-indigo-500">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 2a8 8 0 0 1 8 8"></path>
                </svg>
                <h1 className="text-xl font-bold">QuillPilot</h1>
              </div>
              <span className="ml-2 rounded bg-gray-700 px-2 py-1 text-xs font-medium">BETA</span>
            </div>
            {isConnected && (
              <div className="flex items-center gap-4">
                <Link to="/channels" className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors">
                  <Settings size={18} />
                  <span>Channel Integration</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-6">
        {isConnected ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="connect" disabled={activeTab !== "connect"}>1. Connect</TabsTrigger>
              <TabsTrigger value="goal" disabled={activeTab !== "goal" && activeTab !== "connect"}>2. Set Goal</TabsTrigger>
              <TabsTrigger value="offers" disabled={!currentBusinessGoal}>3. Define Offers</TabsTrigger>
              <TabsTrigger value="channels">4. Channel Integration</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            </TabsList>
            
            <TabsContent value="connect" className="space-y-8 py-4">
              <div className="flex items-center space-x-2 text-sm text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>Store connected successfully!</span>
              </div>
              <Button onClick={() => setActiveTab("goal")}>Continue to Step 2</Button>
            </TabsContent>
            
            <TabsContent value="goal" className="space-y-8 py-4">
              <GoalSelector 
                onGoalSelected={handleGoalSelected}
                selectedGoal={currentBusinessGoal}
              />
            </TabsContent>
            
            <TabsContent value="offers" className="space-y-8 py-4">
              <OfferManager 
                offers={currentOffers}
                channels={currentChannels}
                onUpdateOffers={handleOffersUpdated}
                onUpdateChannels={handleChannelsUpdated}
              />
              
              <ChannelStatus className="mt-8" />
              
              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setActiveTab("channels")}
                >
                  Continue to Channel Integration
                </Button>
                <Button 
                  onClick={handleStartLearning}
                  disabled={currentOffers.length === 0 || !currentChannels.some(c => c.isEnabled)}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Skip to Dashboard
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="channels" className="space-y-8 py-4">
              <ChannelIntegrationManager 
                onIntegrationsUpdated={(integrations) => {
                  // Handle integrations update if needed
                  console.log('Integrations updated:', integrations);
                }}
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleStartLearning}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Continue to Dashboard
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="dashboard" className="space-y-8 py-4">
              <Dashboard />
              <OfferPage userId={userId} currentScreen="dashboard" />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="py-12">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">AI-Powered Personalization for Shopify</h2>
              <p className="text-xl text-gray-300 mb-8">
                Use reinforcement learning to automatically optimize customer offers and communication channels
              </p>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800 p-6 rounded-lg">
                  <div className="text-indigo-400 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-8 w-8">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Smart Learning</h3>
                  <p className="text-gray-400">Our AI learns from customer interactions to optimize engagement</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                  <div className="text-indigo-400 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-8 w-8">
                      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Personalized Offers</h3>
                  <p className="text-gray-400">Target each customer with the offer most likely to convert</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                  <div className="text-indigo-400 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-8 w-8">
                      <path d="M12 20v-6M6 20V10M18 20V4"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Real-time Analytics</h3>
                  <p className="text-gray-400">Track performance and see how the AI improves over time</p>
                </div>
              </div>
            </div>
            
            <ShopifyAuth onConnect={handleConnect} isConnecting={isConnecting} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
