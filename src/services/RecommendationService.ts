interface CustomerFeatures {
  recency: number;
  frequency: number;
  monetary_value: number;
  engagement_score: number;
  discount_sensitive: boolean;
  free_shipping_preferred: boolean;
  email_opens: number;
  sms_response: number;
  push_response: number;
  last_purchase_days: number;
}

interface Recommendation {
  type: 'discount' | 'free_shipping';
  value: number;
  channel: 'email' | 'sms' | 'push';
  timing: 'immediate' | 'next_day';
}

export class RecommendationService {
  private static calculateEngagementScore(customer: any): number {
    const { totalOrders, totalSpent, averageOrderValue } = customer.metrics;
    // Normalize values between 0 and 1
    const normalizedOrders = Math.min(totalOrders / 10, 1);
    const normalizedSpent = Math.min(totalSpent / 1000, 1);
    const normalizedAOV = Math.min(averageOrderValue / 200, 1);
    
    return (normalizedOrders + normalizedSpent + normalizedAOV) / 3;
  }

  private static calculateRecency(lastOrderDate: string | null): number {
    if (!lastOrderDate) return 90; // Max recency if no order
    const days = Math.floor((new Date().getTime() - new Date(lastOrderDate).getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(days, 90); // Cap at 90 days
  }

  private static prepareCustomerFeatures(customer: any): CustomerFeatures {
    const engagementScore = this.calculateEngagementScore(customer);
    const recency = this.calculateRecency(customer.metrics.lastOrderDate);
    
    return {
      recency,
      frequency: customer.metrics.totalOrders,
      monetary_value: customer.metrics.totalSpent,
      engagement_score: engagementScore,
      // Derive these values based on customer behavior
      discount_sensitive: customer.metrics.averageOrderValue < 50,
      free_shipping_preferred: customer.metrics.averageOrderValue > 100,
      email_opens: 0.8, // Default values, should be replaced with actual data
      sms_response: 0.6,
      push_response: 0.4,
      last_purchase_days: recency
    };
  }

  static async getRecommendation(customer: any): Promise<Recommendation> {
    try {
      const features = this.prepareCustomerFeatures(customer);
      
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(features),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting recommendation:', error);
      // Fallback recommendation if the service fails
      return {
        type: 'discount',
        value: 10,
        channel: 'email',
        timing: 'immediate'
      };
    }
  }
} 