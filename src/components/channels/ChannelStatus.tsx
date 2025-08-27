
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import MessagingService from '@/services/messaging-service';

interface ChannelStatusProps {
  className?: string;
}

const ChannelStatus: React.FC<ChannelStatusProps> = ({ className }) => {
  const messagingService = MessagingService.getInstance();
  
  const channels = [
    { name: 'Email', type: 'email' as const, description: 'SendGrid Integration' },
    { name: 'SMS', type: 'sms' as const, description: 'Twilio SMS Integration' },
    { name: 'Push Notifications', type: 'push' as const, description: 'Firebase Cloud Messaging' },
    { name: 'WhatsApp', type: 'whatsapp' as const, description: 'Twilio WhatsApp Business API' }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Messaging Channels</CardTitle>
        <CardDescription>
          Status of your configured messaging channels for personalized offers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {channels.map(channel => (
            <div key={channel.type} className="flex items-center justify-between border-b pb-2 last:border-0">
              <div>
                <p className="font-medium">{channel.name}</p>
                <p className="text-sm text-muted-foreground">{channel.description}</p>
              </div>
              {messagingService.isChannelConfigured(channel.type) ? (
                <Badge className="bg-green-500 hover:bg-green-600">
                  <Check className="h-4 w-4 mr-1" /> Configured
                </Badge>
              ) : (
                <Badge variant="outline">
                  <X className="h-4 w-4 mr-1" /> Not Configured
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChannelStatus;
