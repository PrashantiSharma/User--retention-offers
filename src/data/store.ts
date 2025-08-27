
// Mock Shopify store data
export const store = {
  id: "mock-store-id",
  name: "QuillPilot",
  url: "quillpilot.com",
  plan: "Advanced",
  createdAt: "2023-01-15T10:30:00Z"
};

// Mock store metrics
export const metrics = {
  totalRevenue: 153420,
  revenueGrowth: 8.2,
  averageOrderValue: 72.50,
  aovGrowth: 5.3,
  returningCustomersPercent: 42,
  returningCustomersGrowth: 12.5,
  conversionRate: 3.8,
  conversionRateGrowth: 0.7,
  // New personalization-focused metrics
  personalizationLift: 24.5, // % increase from personalized offers vs static
  customerSatisfactionScore: 4.7, // Out of 5
  recommendationAccuracy: 89.3, // % of recommendations that match customer preferences
  engagementRate: 63.8 // % of customers who engage with personalized content
};
