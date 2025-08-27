
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { offerPerformance, liveDecisionFeed } from '@/data/offers';

const OfferPerformance: React.FC = () => {
  // Transform data for personalization comparison chart
  const personalizationData = offerPerformance.map(offer => ({
    name: offer.name,
    personalized: offer.personalizedConversionRate,
    general: offer.generalConversionRate,
    lift: ((offer.personalizedConversionRate - offer.generalConversionRate) / offer.generalConversionRate * 100).toFixed(1)
  }));

  return (
    <div className="grid gap-4">
      <Card className="col-span-3">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Personalization Performance</CardTitle>
              <CardDescription>
                Conversion rates with personalized vs. general offers
              </CardDescription>
            </div>
            <Badge variant="outline" className="ml-2">
              AI Optimized
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={personalizationData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="personalized" fill="#8884d8" name="Personalized" />
              <Bar dataKey="general" fill="#82ca9d" name="Generic" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {offerPerformance.map((offer, index) => (
          <Card key={index} className={index === 0 ? "border-indigo-400 border-2" : ""}>
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle className="text-sm font-medium">{offer.name}</CardTitle>
                <Badge variant={index === 0 ? "default" : "outline"}>
                  {index === 0 ? "Top Personalized Offer" : `Rank #${index + 1}`}
                </Badge>
              </div>
              <CardDescription>
                {offer.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Personalized</span>
                  <span className="font-medium">{offer.personalizedConversionRate}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Generic</span>
                  <span className="font-medium">{offer.generalConversionRate}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Lift</span>
                  <span className="font-medium text-green-500">
                    +{((offer.personalizedConversionRate - offer.generalConversionRate) / offer.generalConversionRate * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Customer Satisfaction</span>
                  <span className="font-medium">{offer.customerSatisfactionScore}/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full" 
                    style={{ width: `${(offer.customerSatisfactionScore/5) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personalized Offer Feed</CardTitle>
          <CardDescription>
            Recent personalized offers delivered to customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {liveDecisionFeed.map((decision, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Customer {decision.customerId}</span>
                    <Badge variant="outline" className="text-xs">
                      {decision.customerSegment}
                    </Badge>
                  </div>
                  <div className="text-sm mt-1">
                    <span className="text-muted-foreground">Offered: </span>
                    {decision.selectedOffer} via {decision.selectedChannel}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {decision.personalizationFactors.map((factor, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={
                      decision.status === 'converted' ? 'default' : 
                      decision.status === 'sent' ? 'outline' : 'secondary'
                    }
                  >
                    {decision.status === 'converted' ? 'Converted' : 
                     decision.status === 'sent' ? 'Sent' : 'No Response'}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(decision.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded p-3 shadow-md">
        <p className="font-medium text-sm">{label}</p>
        <div className="mt-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Personalized:</span>
            <span className="font-medium">{payload[0].value}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Generic:</span>
            <span className="font-medium">{payload[1].value}%</span>
          </div>
          <div className="flex justify-between items-center text-green-500">
            <span className="text-xs">Lift:</span>
            <span className="font-medium">
              {payload[0].payload.lift}%
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default OfferPerformance;
