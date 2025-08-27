import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ShopifyAuthProps {
  onConnect: (shopUrl: string) => void;
  isConnecting: boolean;
}

const ShopifyAuth: React.FC<ShopifyAuthProps> = ({ onConnect, isConnecting }) => {
  const [shopUrl, setShopUrl] = useState('');
  
  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (shopUrl) {
      onConnect(shopUrl);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Connect your Shopify store</CardTitle>
        <CardDescription>
          Enter your Shopify store URL to get started with QuillPilot.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleConnect} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="shopUrl"
              placeholder="yourstorename.myshopify.com"
              value={shopUrl}
              onChange={(e) => setShopUrl(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isConnecting}>
            {isConnecting ? "Connecting..." : "Connect Store"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        <p>This is a demo app. No actual Shopify integration will occur.</p>
      </CardFooter>
    </Card>
  );
};

export default ShopifyAuth;
