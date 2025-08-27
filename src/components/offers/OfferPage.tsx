import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuillPilotAPI } from '@/services/quillpilot-api';
import { WhatsAppService } from '@/services/whatsapp-service';
import { Offer } from './OfferManager';
import { useToast } from "@/hooks/use-toast";
import { MessageCircle } from 'lucide-react';

interface OfferPageProps {
  userId: string;
  currentScreen: string;
}

interface ShopifyCustomer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  metrics: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate: string | null;
  };
}

interface Decision {
  type: 'offer' | 'message';
  content: string;
  offer?: Offer;
  actions: Array<{
    type: 'button';
    text: string;
    action: string;
  }>;
  metadata: {
    timestamp: string;
    screen: string;
    userId: string;
    isReturningUser?: boolean;
    isHighValueUser?: boolean;
    isBrowserUser?: boolean;
  };
}

const OfferPage: React.FC<OfferPageProps> = ({ userId, currentScreen }) => {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<ShopifyCustomer | null>(null);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch customer data from Shopify
        const customerResponse = await fetch(`/api/shopify/customers/${userId}`);
        if (!customerResponse.ok) {
          throw new Error('Failed to fetch customer data');
        }
        const customerData = await customerResponse.json();
        setCustomer(customerData.customer);

        // Fetch personalized offer
        await QuillPilotAPI.collectEnhancedContext(userId, {
          userId,
          behavior: {
            currentScreen,
            timeOnPage: Date.now() - performance.now(),
            interactions: []
          },
          preferences: {},
          history: []
        });

        const decision = await QuillPilotAPI.getEnhancedDecision(userId, currentScreen);
        setDecision(decision);
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, currentScreen]);

  const handleSendWhatsApp = async () => {
    if (!decision?.offer || !customer?.phone) {
      toast({
        title: "Error",
        description: "Customer's phone number is not available",
        variant: "destructive",
      });
      return;
    }

    setSendingWhatsApp(true);
    try {
      const success = await WhatsAppService.getInstance().sendOffer(customer.phone, decision.offer);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400">
        {error}
      </div>
    );
  }

  if (!decision || decision.type !== 'offer') {
    return (
      <div className="text-center text-gray-400">
        No personalized offer available at this time
      </div>
    );
  }

  const renderOfferContent = () => {
    if (!decision.offer) return 'Special offer available';

    switch (decision.offer.type) {
      case 'percentage':
        return `${decision.offer.value}% off your purchase`;
      case 'fixed':
        return `$${decision.offer.value} off your order`;
      case 'bundle':
        return `${decision.offer.value}% off when you buy multiple items`;
      case 'freeShipping':
        return 'Free shipping on your order';
      default:
        return 'Special offer available';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Personalized Offer</CardTitle>
          <CardDescription>
            Based on your shopping behavior and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-2xl font-bold text-indigo-500">
              {renderOfferContent()}
            </div>
            
            <div className="grid gap-4">
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={() => {
                  // Handle offer application
                  console.log('Applying offer:', decision.offer);
                }}
              >
                Apply Offer
              </Button>

              {customer?.phone ? (
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
                <div className="text-sm text-gray-500 text-center">
                  No phone number available for this customer
                </div>
              )}
            </div>

            <div className="text-sm text-gray-400">
              {decision.content}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfferPage;
