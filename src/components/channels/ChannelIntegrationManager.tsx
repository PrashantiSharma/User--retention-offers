import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from 'lucide-react';
import ShopifyIntegration from '../integrations/ShopifyIntegration';

interface ChannelIntegration {
  id: string;
  type: 'email' | 'sms' | 'push' | 'whatsapp';
  isConfigured: boolean;
  providerName: string;
  apiKey?: string;
  endpoint?: string;
  fromAddress?: string;
  templateId?: string;
}

const defaultIntegrations: ChannelIntegration[] = [
  {
    id: "email-sendgrid",
    type: "email",
    isConfigured: false,
    providerName: "SendGrid",
    apiKey: "",
    fromAddress: "",
    templateId: ""
  },
  {
    id: "sms-twilio",
    type: "sms",
    isConfigured: false,
    providerName: "Twilio",
    apiKey: "",
    endpoint: ""
  },
  {
    id: "push-fcm",
    type: "push",
    isConfigured: false,
    providerName: "Firebase Cloud Messaging",
    apiKey: "",
  },
  {
    id: "whatsapp-twilio",
    type: "whatsapp",
    isConfigured: false,
    providerName: "Twilio WhatsApp Business API",
    apiKey: "",
    fromAddress: ""
  }
];

interface ChannelIntegrationManagerProps {
  onIntegrationsUpdated?: (integrations: ChannelIntegration[]) => void;
}

const ChannelIntegrationManager: React.FC<ChannelIntegrationManagerProps> = ({ 
  onIntegrationsUpdated 
}) => {
  const [integrations, setIntegrations] = useState<ChannelIntegration[]>(defaultIntegrations);
  const [testMessage, setTestMessage] = useState("");
  const [testRecipient, setTestRecipient] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("customer-view");
  const { toast } = useToast();

  const handleUpdateIntegration = (id: string, updates: Partial<ChannelIntegration>) => {
    const updatedIntegrations = integrations.map(integration => 
      integration.id === id ? { ...integration, ...updates } : integration
    );
    setIntegrations(updatedIntegrations);
    
    if (onIntegrationsUpdated) {
      onIntegrationsUpdated(updatedIntegrations);
    }
  };

  const handleSaveIntegration = (id: string) => {
    const integration = integrations.find(i => i.id === id);
    
    if (!integration) return;
    
    // Validate the integration configuration
    if (integration.type === 'email' && (!integration.apiKey || !integration.fromAddress)) {
      toast({
        title: "Missing information",
        description: "Please provide API key and from address for email integration",
        variant: "destructive"
      });
      return;
    }
    
    if (integration.type === 'sms' && (!integration.apiKey || !integration.endpoint)) {
      toast({
        title: "Missing information",
        description: "Please provide API key and endpoint for SMS integration",
        variant: "destructive"
      });
      return;
    }
    
    // Mark as configured
    handleUpdateIntegration(id, { isConfigured: true });
    
    toast({
      title: "Integration saved",
      description: `${integration.providerName} has been successfully configured`
    });
  };

  const handleSendTest = async (id: string) => {
    const integration = integrations.find(i => i.id === id);
    
    if (!integration || !testRecipient || !testMessage) {
      toast({
        title: "Missing information",
        description: "Please provide recipient and message for test",
        variant: "destructive"
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      // This would be a real API call in a production app
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Test message sent",
        description: `A test message has been sent to ${testRecipient} via ${integration.providerName}`
      });
    } catch (error) {
      toast({
        title: "Failed to send test",
        description: "An error occurred while sending the test message",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-indigo-400 hover:text-indigo-300 mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-white">Channel Integration Settings</h1>
        <p className="text-gray-400 mt-2">Configure and test your messaging channels for personalized offers</p>
      </div>
      
      <Tabs defaultValue="customer-view" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customer-view">Customer Analysis</TabsTrigger>
          <TabsTrigger value="shopify">Shopify Integration</TabsTrigger>
          <TabsTrigger value="channel-settings">Channel Integration</TabsTrigger>
        </TabsList>
        

        
        <TabsContent value="shopify">
          <ShopifyIntegration onCustomersLoaded={(customers) => {
            // Handle loaded customers if needed
            console.log('Shopify customers loaded:', customers);
          }} />
        </TabsContent>
        
        <TabsContent value="channel-settings">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Channel Integration</CardTitle>
              <CardDescription>
                Configure messaging channels to send personalized offers to your customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="email" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="sms">SMS</TabsTrigger>
                  <TabsTrigger value="push">Push</TabsTrigger>
                  <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                </TabsList>
                
                {/* Email Integration */}
                <TabsContent value="email" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">SendGrid Email Integration</h3>
                        <p className="text-sm text-muted-foreground">
                          Send personalized offers via email using SendGrid
                        </p>
                      </div>
                      <Switch 
                        checked={integrations.find(i => i.id === "email-sendgrid")?.isConfigured || false}
                        onCheckedChange={(checked) => {
                          if (!checked) {
                            handleUpdateIntegration("email-sendgrid", { isConfigured: false });
                          }
                        }}
                        disabled={!integrations.find(i => i.id === "email-sendgrid")?.isConfigured}
                      />
                    </div>
                    
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="sendgrid-api-key">SendGrid API Key</Label>
                        <Input 
                          id="sendgrid-api-key"
                          type="password" 
                          placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxx"
                          value={integrations.find(i => i.id === "email-sendgrid")?.apiKey || ""}
                          onChange={(e) => handleUpdateIntegration("email-sendgrid", { apiKey: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="sendgrid-from">From Email</Label>
                        <Input 
                          id="sendgrid-from"
                          type="email"
                          placeholder="offers@yourcompany.com"
                          value={integrations.find(i => i.id === "email-sendgrid")?.fromAddress || ""}
                          onChange={(e) => handleUpdateIntegration("email-sendgrid", { fromAddress: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="sendgrid-template">Email Template ID (Optional)</Label>
                        <Input 
                          id="sendgrid-template"
                          placeholder="d-xxxxxxxxxxxxxxxxxxxxxxx"
                          value={integrations.find(i => i.id === "email-sendgrid")?.templateId || ""}
                          onChange={(e) => handleUpdateIntegration("email-sendgrid", { templateId: e.target.value })}
                        />
                      </div>
                      
                      <Button 
                        onClick={() => handleSaveIntegration("email-sendgrid")}
                        disabled={
                          !integrations.find(i => i.id === "email-sendgrid")?.apiKey || 
                          !integrations.find(i => i.id === "email-sendgrid")?.fromAddress
                        }
                      >
                        Save Configuration
                      </Button>
                      
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-medium mb-2">Test Email Integration</h4>
                        <div className="space-y-4">
                          <div className="grid gap-2">
                            <Label htmlFor="test-email-recipient">Recipient Email</Label>
                            <Input 
                              id="test-email-recipient"
                              type="email"
                              placeholder="customer@example.com"
                              value={testRecipient}
                              onChange={(e) => setTestRecipient(e.target.value)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="test-email-message">Test Message</Label>
                            <Input 
                              id="test-email-message"
                              placeholder="Your special offer is here!"
                              value={testMessage}
                              onChange={(e) => setTestMessage(e.target.value)}
                            />
                          </div>
                          <Button 
                            onClick={() => handleSendTest("email-sendgrid")}
                            disabled={isSending || !testRecipient || !testMessage || !integrations.find(i => i.id === "email-sendgrid")?.isConfigured}
                          >
                            {isSending ? "Sending..." : "Send Test Email"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* SMS Integration */}
                <TabsContent value="sms" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Twilio SMS Integration</h3>
                        <p className="text-sm text-muted-foreground">
                          Send personalized offers via SMS using Twilio
                        </p>
                      </div>
                      <Switch 
                        checked={integrations.find(i => i.id === "sms-twilio")?.isConfigured || false}
                        onCheckedChange={(checked) => {
                          if (!checked) {
                            handleUpdateIntegration("sms-twilio", { isConfigured: false });
                          }
                        }}
                        disabled={!integrations.find(i => i.id === "sms-twilio")?.isConfigured}
                      />
                    </div>
                    
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="twilio-api-key">Twilio Auth Token</Label>
                        <Input 
                          id="twilio-api-key"
                          type="password" 
                          placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          value={integrations.find(i => i.id === "sms-twilio")?.apiKey || ""}
                          onChange={(e) => handleUpdateIntegration("sms-twilio", { apiKey: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="twilio-endpoint">Twilio Phone Number</Label>
                        <Input 
                          id="twilio-endpoint"
                          placeholder="+15551234567"
                          value={integrations.find(i => i.id === "sms-twilio")?.endpoint || ""}
                          onChange={(e) => handleUpdateIntegration("sms-twilio", { endpoint: e.target.value })}
                        />
                      </div>
                      
                      <Button 
                        onClick={() => handleSaveIntegration("sms-twilio")}
                        disabled={
                          !integrations.find(i => i.id === "sms-twilio")?.apiKey || 
                          !integrations.find(i => i.id === "sms-twilio")?.endpoint
                        }
                      >
                        Save Configuration
                      </Button>
                      
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-medium mb-2">Test SMS Integration</h4>
                        <div className="space-y-4">
                          <div className="grid gap-2">
                            <Label htmlFor="test-sms-recipient">Recipient Phone</Label>
                            <Input 
                              id="test-sms-recipient"
                              placeholder="+15557654321"
                              value={testRecipient}
                              onChange={(e) => setTestRecipient(e.target.value)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="test-sms-message">Test Message</Label>
                            <Input 
                              id="test-sms-message"
                              placeholder="Your special offer is here!"
                              value={testMessage}
                              onChange={(e) => setTestMessage(e.target.value)}
                            />
                          </div>
                          <Button 
                            onClick={() => handleSendTest("sms-twilio")}
                            disabled={isSending || !testRecipient || !testMessage || !integrations.find(i => i.id === "sms-twilio")?.isConfigured}
                          >
                            {isSending ? "Sending..." : "Send Test SMS"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Push Notifications Integration */}
                <TabsContent value="push" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Firebase Push Notifications</h3>
                        <p className="text-sm text-muted-foreground">
                          Send personalized offers via push notifications using Firebase Cloud Messaging
                        </p>
                      </div>
                      <Switch 
                        checked={integrations.find(i => i.id === "push-fcm")?.isConfigured || false}
                        onCheckedChange={(checked) => {
                          if (!checked) {
                            handleUpdateIntegration("push-fcm", { isConfigured: false });
                          }
                        }}
                        disabled={!integrations.find(i => i.id === "push-fcm")?.isConfigured}
                      />
                    </div>
                    
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="fcm-api-key">Firebase Server Key</Label>
                        <Input 
                          id="fcm-api-key"
                          type="password" 
                          placeholder="AAAAxxxxxxxxx:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          value={integrations.find(i => i.id === "push-fcm")?.apiKey || ""}
                          onChange={(e) => handleUpdateIntegration("push-fcm", { apiKey: e.target.value })}
                        />
                      </div>
                      
                      <Button 
                        onClick={() => handleSaveIntegration("push-fcm")}
                        disabled={!integrations.find(i => i.id === "push-fcm")?.apiKey}
                      >
                        Save Configuration
                      </Button>
                      
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-medium mb-2">Test Push Notification</h4>
                        <div className="space-y-4">
                          <div className="grid gap-2">
                            <Label htmlFor="test-push-recipient">Device Token or Topic</Label>
                            <Input 
                              id="test-push-recipient"
                              placeholder="eEw23DfghTYui7654..."
                              value={testRecipient}
                              onChange={(e) => setTestRecipient(e.target.value)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="test-push-message">Test Message</Label>
                            <Input 
                              id="test-push-message"
                              placeholder="Your special offer is here!"
                              value={testMessage}
                              onChange={(e) => setTestMessage(e.target.value)}
                            />
                          </div>
                          <Button 
                            onClick={() => handleSendTest("push-fcm")}
                            disabled={isSending || !testRecipient || !testMessage || !integrations.find(i => i.id === "push-fcm")?.isConfigured}
                          >
                            {isSending ? "Sending..." : "Send Test Notification"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* WhatsApp Integration */}
                <TabsContent value="whatsapp" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Twilio WhatsApp Business API</h3>
                        <p className="text-sm text-muted-foreground">
                          Send personalized offers via WhatsApp
                        </p>
                      </div>
                      <Switch 
                        checked={integrations.find(i => i.id === "whatsapp-twilio")?.isConfigured || false}
                        onCheckedChange={(checked) => {
                          if (!checked) {
                            handleUpdateIntegration("whatsapp-twilio", { isConfigured: false });
                          }
                        }}
                        disabled={!integrations.find(i => i.id === "whatsapp-twilio")?.isConfigured}
                      />
                    </div>
                    
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="whatsapp-api-key">Twilio Auth Token</Label>
                        <Input 
                          id="whatsapp-api-key"
                          type="password" 
                          placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          value={integrations.find(i => i.id === "whatsapp-twilio")?.apiKey || ""}
                          onChange={(e) => handleUpdateIntegration("whatsapp-twilio", { apiKey: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="whatsapp-from">WhatsApp Business Number</Label>
                        <Input 
                          id="whatsapp-from"
                          placeholder="+15551234567"
                          value={integrations.find(i => i.id === "whatsapp-twilio")?.fromAddress || ""}
                          onChange={(e) => handleUpdateIntegration("whatsapp-twilio", { fromAddress: e.target.value })}
                        />
                      </div>
                      
                      <Button 
                        onClick={() => handleSaveIntegration("whatsapp-twilio")}
                        disabled={
                          !integrations.find(i => i.id === "whatsapp-twilio")?.apiKey || 
                          !integrations.find(i => i.id === "whatsapp-twilio")?.fromAddress
                        }
                      >
                        Save Configuration
                      </Button>
                      
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-medium mb-2">Test WhatsApp Integration</h4>
                        <div className="space-y-4">
                          <div className="grid gap-2">
                            <Label htmlFor="test-whatsapp-recipient">Recipient WhatsApp Number</Label>
                            <Input 
                              id="test-whatsapp-recipient"
                              placeholder="+15557654321"
                              value={testRecipient}
                              onChange={(e) => setTestRecipient(e.target.value)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="test-whatsapp-message">Test Message</Label>
                            <Input 
                              id="test-whatsapp-message"
                              placeholder="Your special offer is here!"
                              value={testMessage}
                              onChange={(e) => setTestMessage(e.target.value)}
                            />
                          </div>
                          <Button 
                            onClick={() => handleSendTest("whatsapp-twilio")}
                            disabled={
                              isSending || 
                              !testRecipient || 
                              !testMessage || 
                              !integrations.find(i => i.id === "whatsapp-twilio")?.isConfigured
                            }
                          >
                            {isSending ? "Sending..." : "Send Test WhatsApp"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChannelIntegrationManager;
