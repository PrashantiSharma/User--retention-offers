export interface CustomerMetrics {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string | null;
}

export interface ShopifyCustomer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  metrics: CustomerMetrics;
  segment?: string;
} 