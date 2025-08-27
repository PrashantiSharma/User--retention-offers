import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShopifyCustomer } from '@/types/shopify';

interface CustomerMetrics {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string | null;
}

interface CustomerAnalysisProps {
  customers: ShopifyCustomer[];
}

const CustomerAnalysis: React.FC<CustomerAnalysisProps> = ({ customers }) => {
  const analytics = useMemo(() => {
    const totalCustomers = customers.length;
    const totalRevenue = customers.reduce((sum, customer) => sum + customer.metrics.totalSpent, 0);
    const totalOrders = customers.reduce((sum, customer) => sum + customer.metrics.totalOrders, 0);
    
    // Calculate spending tiers
    const spendingTiers = [
      { range: '0-50', count: 0 },
      { range: '51-200', count: 0 },
      { range: '201-500', count: 0 },
      { range: '501-1000', count: 0 },
      { range: '1000+', count: 0 }
    ];

    customers.forEach(customer => {
      const spent = customer.metrics.totalSpent;
      if (spent <= 50) spendingTiers[0].count++;
      else if (spent <= 200) spendingTiers[1].count++;
      else if (spent <= 500) spendingTiers[2].count++;
      else if (spent <= 1000) spendingTiers[3].count++;
      else spendingTiers[4].count++;
    });

    // Calculate order frequency
    const orderFrequency = [
      { range: '0', count: 0 },
      { range: '1-2', count: 0 },
      { range: '3-5', count: 0 },
      { range: '6-10', count: 0 },
      { range: '10+', count: 0 }
    ];

    customers.forEach(customer => {
      const orders = customer.metrics.totalOrders;
      if (orders === 0) orderFrequency[0].count++;
      else if (orders <= 2) orderFrequency[1].count++;
      else if (orders <= 5) orderFrequency[2].count++;
      else if (orders <= 10) orderFrequency[3].count++;
      else orderFrequency[4].count++;
    });

    return {
      totalCustomers,
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders ? totalRevenue / totalOrders : 0,
      spendingTiers,
      orderFrequency
    };
  }, [customers]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Analysis</CardTitle>
          <CardDescription>
            Insights from your Shopify customer data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-background rounded-lg border">
              <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
              <h3 className="text-2xl font-bold">{analytics.totalCustomers}</h3>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <h3 className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</h3>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
              <h3 className="text-2xl font-bold">{analytics.totalOrders}</h3>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <p className="text-sm font-medium text-muted-foreground">Avg. Order Value</p>
              <h3 className="text-2xl font-bold">{formatCurrency(analytics.averageOrderValue)}</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Spending Distribution</CardTitle>
            <CardDescription>
              Number of customers by spending range
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.spendingTiers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Frequency Distribution</CardTitle>
            <CardDescription>
              Number of customers by order count
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.orderFrequency}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerAnalysis; 