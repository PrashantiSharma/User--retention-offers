import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RecommendationService } from '@/services/RecommendationService';
import { WhatsAppService } from '@/services/whatsapp-service';
import { Offer } from '@/components/offers/OfferManager';
import { useToast } from "@/hooks/use-toast";
import { MessageCircle } from 'lucide-react';
import { ShopifyCustomer } from '@/types/shopify';

interface CustomerMetrics {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string | null;
}

interface CustomerDetailViewProps {
  customers: ShopifyCustomer[];
}

interface Recommendation {
  type: 'discount' | 'free_shipping';
  value: number;
  channel: 'email' | 'sms' | 'push';
  timing: 'immediate' | 'next_day';
}

const CustomerDetailView: React.FC<CustomerDetailViewProps> = ({ customers }) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('All');
  const [selectedCustomer, setSelectedCustomer] = useState<ShopifyCustomer & { segment: string } | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  // AI-driven customer segmentation
  const segmentedCustomers = useMemo(() => {
    return customers.map(customer => {
      // Calculate customer segment based on metrics
      let segment: string;
      const { totalOrders, totalSpent, averageOrderValue } = customer.metrics;

      if (totalOrders === 0) {
        segment = 'New';
      } else if (totalOrders > 0 && totalOrders <= 2) {
        segment = 'Returning';
      } else if (totalSpent > 1000 || (totalOrders > 5 && averageOrderValue > 200)) {
        segment = 'VIP';
      } else if (totalOrders > 2) {
        segment = 'Loyal';
      } else {
        const daysSinceLastOrder = customer.metrics.lastOrderDate
          ? Math.floor((new Date().getTime() - new Date(customer.metrics.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        segment = daysSinceLastOrder > 90 ? 'At Risk' : 'Returning';
      }

      return { ...customer, segment };
    });
  }, [customers]);

  // Filter customers based on search and segment
  const filteredCustomers = useMemo(() => {
    return segmentedCustomers.filter(customer => {
      const matchesSearch = searchQuery === '' ||
        `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSegment = selectedSegment === 'All' || customer.segment === selectedSegment;

      return matchesSearch && matchesSegment;
    });
  }, [segmentedCustomers, searchQuery, selectedSegment]);

  const segments = ['All', 'New', 'Returning', 'Loyal', 'VIP', 'At Risk'];

  const getBadgeVariant = (segment: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (segment) {
      case 'New': return 'default';
      case 'Returning': return 'secondary';
      case 'Loyal': return 'secondary';
      case 'VIP': return 'default';
      case 'At Risk': return 'destructive';
      default: return 'outline';
    }
  };

  const handleSelectCustomer = async (customer: (typeof segmentedCustomers)[0]) => {
    setSelectedCustomer(customer);
    setIsLoading(true);
    try {
      const rec = await RecommendationService.getRecommendation(customer);
      setRecommendation(rec);
    } catch (error) {
      toast({
        title: "Error getting recommendation",
        description: "Failed to get AI recommendation for this customer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatRecommendation = (rec: Recommendation) => {
    const type = rec.type === 'discount' ? `${rec.value}% discount` : 'Free shipping';
    return `${type} via ${rec.channel} (${rec.timing})`;
  };

  const handleSendWhatsApp = async () => {
    if (!selectedCustomer?.phone || !recommendation) {
      toast({
        title: "Error",
        description: "Customer's phone number is not available",
        variant: "destructive",
      });
      return;
    }

    setSendingWhatsApp(true);
    try {
      const offer: Offer = {
        id: Date.now().toString(),
        name: `${recommendation.type === 'discount' ? `${recommendation.value}% Off` : 'Free Shipping'} Offer`,
        type: recommendation.type === 'discount' ? 'percentage' : 'freeShipping',
        value: recommendation.value,
        description: `Special offer for ${selectedCustomer.first_name}: ${recommendation.type === 'discount' ? `${recommendation.value}% off your purchase` : 'Free shipping on your order'}`
      };

      const success = await WhatsAppService.getInstance().sendOffer(selectedCustomer.phone, offer);
      if (success) {
        toast({
          title: "Success",
          description: "Offer sent via WhatsApp!",
        });
      } else {
        throw new Error("Failed to send WhatsApp message");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send offer via WhatsApp. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingWhatsApp(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold">Customer Analysis & Channel Selection</h2>
        <div className="flex flex-wrap gap-2">
          {segments.map((segment) => (
            <Button
              key={segment}
              variant={selectedSegment === segment ? "default" : "outline"}
              onClick={() => setSelectedSegment(segment)}
              className="min-w-[80px]"
            >
              {segment}
            </Button>
          ))}
        </div>
        <div className="relative">
          <Input
            type="search"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="rounded-md border">
            <div className="grid grid-cols-[1fr,1.5fr,1fr,auto] gap-4 p-4 font-medium border-b">
              <div>Name</div>
              <div>Email</div>
              <div>Segment</div>
              <div>Actions</div>
            </div>
            <div className="divide-y">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="grid grid-cols-[1fr,1.5fr,1fr,auto] gap-4 p-4 items-center">
                  <div>
                    {customer.first_name} {customer.last_name}
                  </div>
                  <div>{customer.email}</div>
                  <div>
                    <Badge variant={getBadgeVariant(customer.segment)}>
                      {customer.segment}
                    </Badge>
                  </div>
                  <div>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleSelectCustomer(customer)}
                    >
                      Select
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedCustomer && (
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendation</CardTitle>
              <CardDescription>
                {selectedCustomer ? `Personalized offer for ${selectedCustomer.first_name} ${selectedCustomer.last_name}` : 'Select a customer to get recommendations'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : recommendation ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="font-medium">Recommended Action:</p>
                    <p className="text-lg">{formatRecommendation(recommendation)}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button className="w-full" variant="default">
                      Apply Recommendation
                    </Button>
                    {selectedCustomer?.phone ? (
                      <Button
                        variant="outline"
                        onClick={handleSendWhatsApp}
                        disabled={sendingWhatsApp}
                        className="w-full gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {sendingWhatsApp ? 'Sending...' : 'Send via WhatsApp'}
                      </Button>
                    ) : (
                      <div className="text-sm text-muted-foreground text-center">
                        No phone number available for this customer
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Select a customer to get AI recommendations</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomerDetailView; 