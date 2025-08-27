import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from 'lucide-react';
import CustomerAnalysis from './CustomerAnalysis';
import CustomerDetailView from './CustomerDetailView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShopifyCustomer } from '@/types/shopify';

interface ShopifyIntegrationProps {
  onCustomersLoaded?: (customers: ShopifyCustomer[]) => void;
}

const ShopifyIntegration: React.FC<ShopifyIntegrationProps> = ({ onCustomersLoaded }) => {
  const { toast } = useToast();
  const [shopUrl, setShopUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [customers, setCustomers] = useState<ShopifyCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch('/api/shopify/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shopUrl, accessToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to connect to Shopify');
      }

      setIsConnected(true);
      toast({
        title: "Successfully connected",
        description: "Your Shopify store has been connected.",
      });

      // Load initial customers
      fetchCustomers(1);
    } catch (error: any) {
      console.error('Connection error:', error);
      toast({
        title: "Connection failed",
        description: error.message || 'Failed to connect to Shopify',
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchCustomers = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/shopify/customers?page=${page}&limit=10`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to fetch customers');
      }

      if (page === 1) {
        setCustomers(data.customers);
      } else {
        setCustomers(prev => [...prev, ...data.customers]);
      }
      
      setHasMore(data.pagination.hasMore);
      setCurrentPage(data.pagination.currentPage);
      onCustomersLoaded?.(data.customers);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error fetching customers",
        description: error.message || 'Failed to fetch customer data',
        variant: "destructive",
      });
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchCustomers(currentPage + 1);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Shopify Integration</CardTitle>
          <CardDescription>
            Connect your Shopify store to view and analyze customer data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shopUrl">Shop URL</Label>
                <Input
                  id="shopUrl"
                  placeholder="your-store.myshopify.com"
                  value={shopUrl}
                  onChange={(e) => setShopUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accessToken">Access Token</Label>
                <Input
                  id="accessToken"
                  type="password"
                  placeholder="shpat_xxxxx..."
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting || !shopUrl || !accessToken}
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect to Shopify'
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Connected to {shopUrl}
                    </p>
                  </div>
                </div>
              </div>

              {customers.length > 0 && (
                <Tabs defaultValue="customers" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="customers">Customer List</TabsTrigger>
                    <TabsTrigger value="analysis">Customer Analysis</TabsTrigger>
                    <TabsTrigger value="segments">Customer Segments</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="customers">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Total Orders</TableHead>
                            <TableHead>Total Spent</TableHead>
                            <TableHead>Avg. Order Value</TableHead>
                            <TableHead>Last Order</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customers.map((customer) => (
                            <TableRow key={customer.id}>
                              <TableCell>
                                {customer.first_name} {customer.last_name}
                              </TableCell>
                              <TableCell>{customer.email}</TableCell>
                              <TableCell>{customer.metrics.totalOrders}</TableCell>
                              <TableCell>{formatCurrency(customer.metrics.totalSpent)}</TableCell>
                              <TableCell>{formatCurrency(customer.metrics.averageOrderValue)}</TableCell>
                              <TableCell>{formatDate(customer.metrics.lastOrderDate)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {hasMore && (
                      <Button
                        onClick={loadMore}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full mt-4"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          'Load More'
                        )}
                      </Button>
                    )}
                  </TabsContent>

                  <TabsContent value="analysis">
                    <CustomerAnalysis customers={customers} />
                  </TabsContent>

                  <TabsContent value="segments">
                    <CustomerDetailView customers={customers} />
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopifyIntegration; 