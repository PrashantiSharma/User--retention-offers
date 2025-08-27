
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface Offer {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'bundle' | 'freeShipping';
  value: number;
  description: string;
}

export interface Channel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push';
  isEnabled: boolean;
}

interface OfferManagerProps {
  offers: Offer[];
  channels: Channel[];
  onUpdateOffers: (offers: Offer[]) => void;
  onUpdateChannels: (channels: Channel[]) => void;
}

const OfferManager: React.FC<OfferManagerProps> = ({ 
  offers: initialOffers, 
  channels: initialChannels,
  onUpdateOffers,
  onUpdateChannels
}) => {
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [newOffer, setNewOffer] = useState<Partial<Offer>>({
    name: '',
    type: 'percentage',
    value: 0,
    description: ''
  });

  const handleAddOffer = () => {
    if (!newOffer.name) return;
    
    const offer: Offer = {
      id: `offer-${Date.now()}`,
      name: newOffer.name || '',
      type: newOffer.type || 'percentage',
      value: newOffer.value || 0,
      description: newOffer.description || ''
    };
    
    const updatedOffers = [...offers, offer];
    setOffers(updatedOffers);
    onUpdateOffers(updatedOffers);
    setNewOffer({
      name: '',
      type: 'percentage',
      value: 0,
      description: ''
    });
  };

  const handleRemoveOffer = (id: string) => {
    const updatedOffers = offers.filter(offer => offer.id !== id);
    setOffers(updatedOffers);
    onUpdateOffers(updatedOffers);
  };

  const toggleChannel = (id: string) => {
    const updatedChannels = channels.map(channel => 
      channel.id === id ? { ...channel, isEnabled: !channel.isEnabled } : channel
    );
    setChannels(updatedChannels);
    onUpdateChannels(updatedChannels);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Manage Offers & Channels</CardTitle>
        <CardDescription>
          Define different offers and enable communication channels for the AI to use
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="offers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="offers">Offers</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
          </TabsList>
          
          <TabsContent value="offers" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <Label htmlFor="name">Offer Name</Label>
                  <Input 
                    id="name" 
                    value={newOffer.name} 
                    onChange={(e) => setNewOffer({...newOffer, name: e.target.value})}
                    placeholder="e.g., Summer Sale"
                  />
                </div>
                
                <div className="col-span-3">
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={newOffer.type} 
                    onValueChange={(value: 'percentage' | 'fixed' | 'bundle' | 'freeShipping') => 
                      setNewOffer({...newOffer, type: value})
                    }
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage Off</SelectItem>
                      <SelectItem value="fixed">Fixed Amount Off</SelectItem>
                      <SelectItem value="bundle">Product Bundle</SelectItem>
                      <SelectItem value="freeShipping">Free Shipping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="value">Value</Label>
                  <Input 
                    id="value" 
                    type="number" 
                    value={newOffer.value?.toString()} 
                    onChange={(e) => setNewOffer({...newOffer, value: parseFloat(e.target.value) || 0})}
                    disabled={newOffer.type === 'freeShipping'}
                  />
                </div>
                
                <div className="col-span-3 flex items-end">
                  <Button onClick={handleAddOffer} className="w-full">Add Offer</Button>
                </div>
              </div>
              
              <div className="border rounded-md">
                <div className="bg-muted px-4 py-2 rounded-t-md grid grid-cols-12 gap-4 font-medium">
                  <div className="col-span-4">Name</div>
                  <div className="col-span-3">Type</div>
                  <div className="col-span-3">Value</div>
                  <div className="col-span-2">Actions</div>
                </div>
                {offers.length > 0 ? (
                  <div className="divide-y">
                    {offers.map((offer) => (
                      <div key={offer.id} className="px-4 py-3 grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-4">{offer.name}</div>
                        <div className="col-span-3 capitalize">
                          {offer.type === 'percentage' ? 'Percentage Off' : 
                           offer.type === 'fixed' ? 'Fixed Amount Off' : 
                           offer.type === 'bundle' ? 'Product Bundle' : 'Free Shipping'}
                        </div>
                        <div className="col-span-3">
                          {offer.type === 'percentage' ? `${offer.value}%` : 
                           offer.type === 'fixed' ? `$${offer.value}` : 
                           offer.type === 'bundle' ? `${offer.value} items` : 'N/A'}
                        </div>
                        <div className="col-span-2">
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleRemoveOffer(offer.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    No offers defined yet. Add your first offer above.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="channels" className="space-y-4">
            <div className="space-y-4">
              {channels.map((channel) => (
                <div key={channel.id} className="flex items-center justify-between border p-4 rounded-lg">
                  <div>
                    <h3 className="font-medium">{channel.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {channel.type === 'email' && 'Send promotional emails to customers'}
                      {channel.type === 'sms' && 'Send text messages to customers'}
                      {channel.type === 'push' && 'Send push notifications to app users'}
                    </p>
                  </div>
                  <Button 
                    variant={channel.isEnabled ? "default" : "outline"}
                    onClick={() => toggleChannel(channel.id)}
                  >
                    {channel.isEnabled ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              ))}
              <p className="text-sm text-muted-foreground">
                The AI will only use enabled channels to communicate with customers.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OfferManager;
