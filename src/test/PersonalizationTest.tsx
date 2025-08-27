
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QuillPilotAPI } from '@/services/quillpilot-api';
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3004/api';

// Test user profiles
const testUsers = [
  {
    id: "new-user-1",
    name: "New Customer",
    profile: {
      isReturningUser: false,
      cartValue: 45,
      viewedProducts: 3,
      timeOfDay: new Date().getHours(),
      weekend: [0, 6].includes(new Date().getDay())
    }
  },
  {
    id: "returning-user-1",
    name: "Returning Customer",
    profile: {
      isReturningUser: true,
      cartValue: 85,
      viewedProducts: 7,
      timeOfDay: new Date().getHours(),
      weekend: [0, 6].includes(new Date().getDay()),
      purchases: [{ date: "2023-04-15", value: 65 }]
    }
  },
  {
    id: "high-value-user-1",
    name: "High Value Customer",
    profile: {
      isReturningUser: true,
      cartValue: 210,
      viewedProducts: 12,
      timeOfDay: new Date().getHours(),
      weekend: [0, 6].includes(new Date().getDay()),
      purchases: [
        { date: "2023-03-10", value: 120 },
        { date: "2023-04-22", value: 85 },
        { date: "2023-05-05", value: 145 }
      ]
    }
  },
  {
    id: "at-risk-user-1",
    name: "At-Risk Customer",
    profile: {
      isReturningUser: true,
      cartValue: 35,
      viewedProducts: 2,
      timeOfDay: new Date().getHours(),
      weekend: [0, 6].includes(new Date().getDay()),
      purchases: [{ date: "2023-02-01", value: 95 }], // Last purchase was a while ago
      daysSinceLastPurchase: 60
    }
  }
];

interface TestResult {
  userId: string;
  userName: string;
  selectedOffer: string;
  selectedChannel: string;
  probability: number;
  personalizationFactors: string[];
  timestamp: string;
}

const PersonalizationTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState("product-page");
  const { toast } = useToast();

  // Run tests for all users
  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    try {
      // Test each user profile
      for (const user of testUsers) {
        await testPersonalization(user);
      }
      
      toast({
        title: "Tests completed successfully",
        description: `Tested personalization for ${testUsers.length} user profiles`,
      });
    } catch (error) {
      console.error('Error running tests:', error);
      toast({
        title: "Test error",
        description: "Failed to complete personalization tests. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  // Test personalization for a specific user
  const testPersonalization = async (user: typeof testUsers[0]) => {
    try {
      // Step 1: Send context to API
      await axios.post(`${API_BASE_URL}/collect-context`, {
        userId: user.id,
        context: {
          ...user.profile,
          currentScreen: selectedScreen
        }
      });
      
      // Step 2: Get decision from API
      const response = await axios.post(`${API_BASE_URL}/get-decision`, {
        userId: user.id,
        currentScreen: selectedScreen
      });
      
      const decision = response.data;
      
      // Step 3: Record result
      if (decision && decision.offer) {
        setTestResults(prev => [...prev, {
          userId: user.id,
          userName: user.name,
          selectedOffer: decision.offer.name || "Unknown offer",
          selectedChannel: decision.channel || "email",
          probability: decision.metadata?.personalizationScore || 0,
          personalizationFactors: decision.metadata?.personalizationFactors || [],
          timestamp: new Date().toISOString()
        }]);
      }
      
      // Optional: Simulate a conversion for some users
      if (user.id === "returning-user-1" || user.id === "high-value-user-1") {
        await axios.post(`${API_BASE_URL}/update-reward`, {
          userId: user.id,
          offerId: decision.offer?.id,
          reward: 1.0,
          didConvert: true
        });
      }
    } catch (error) {
      console.error(`Error testing personalization for ${user.name}:`, error);
      throw error;
    }
  };

  // Clear all test results
  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Personalization Test Suite</CardTitle>
          <CardDescription>
            Test how the AI personalizes offers for different customer profiles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <label htmlFor="screen-select" className="text-sm font-medium">Test Screen</label>
                <select 
                  id="screen-select"
                  value={selectedScreen}
                  onChange={(e) => setSelectedScreen(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="product-page">Product Page</option>
                  <option value="cart">Shopping Cart</option>
                  <option value="checkout">Checkout</option>
                  <option value="homepage">Homepage</option>
                </select>
              </div>
              
              <div className="flex gap-2 items-end">
                <Button onClick={runAllTests} disabled={isRunningTests}>
                  {isRunningTests ? "Running Tests..." : "Run All Tests"}
                </Button>
                <Button variant="outline" onClick={clearResults} disabled={isRunningTests || testResults.length === 0}>
                  Clear Results
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Test User Profiles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {testUsers.map((user) => (
                  <Card key={user.id} className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{user.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Profile:</span>
                        <Badge variant="outline">
                          {user.profile.isReturningUser ? "Returning" : "New"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cart Value:</span>
                        <span>${user.profile.cartValue}</span>
                      </div>
                      {user.profile.purchases && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Past Purchases:</span>
                          <span>{user.profile.purchases.length}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personalization Results</h3>
              {testResults.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Selected Offer</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Channel</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Score</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Factors</th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {testResults.map((result, idx) => (
                        <tr key={`${result.userId}-${idx}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="font-medium">{result.userName}</div>
                            <div className="text-muted-foreground text-xs">{result.userId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{result.selectedOffer}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Badge variant="outline">{result.selectedChannel}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="w-full bg-secondary h-2 rounded-full">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${Math.round(result.probability * 100)}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-right mt-1">{Math.round(result.probability * 100)}%</div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex flex-wrap gap-1">
                              {result.personalizationFactors.map((factor, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {factor}
                                </Badge>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-8 border rounded-md bg-muted/30">
                  <p className="text-muted-foreground">
                    {isRunningTests 
                      ? "Running tests..." 
                      : "No test results yet. Click 'Run All Tests' to start testing personalization."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalizationTest;
