
import { Offer, Channel } from '@/components/offers/OfferManager';

// Mock offer data
export const offers = [
  {
    id: "o1001",
    name: "10% Off First Purchase",
    type: "percentage" as const,
    value: 10,
    description: "10% discount for first-time customers",
    customerPreferenceScore: 0.78, // How well this matches customer preferences
    conversionProbability: 0.65 // Probability of conversion for targeted customers
  },
  {
    id: "o1002",
    name: "$15 Off $75+",
    type: "fixed" as const,
    value: 15,
    description: "$15 discount on orders over $75",
    customerPreferenceScore: 0.82,
    conversionProbability: 0.58
  },
  {
    id: "o1003",
    name: "Buy 2 Get 1 Free",
    type: "bundle" as const,
    value: 3,
    description: "Buy 2 items, get 1 free (equal or lesser value)",
    customerPreferenceScore: 0.71,
    conversionProbability: 0.52
  },
  {
    id: "o1004",
    name: "Free Shipping",
    type: "freeShipping" as const,
    value: 0,
    description: "Free shipping on all orders",
    customerPreferenceScore: 0.89,
    conversionProbability: 0.73
  }
];

// Mock communication channels
export const channels = [
  {
    id: "ch1001",
    name: "Email Marketing",
    type: "email" as const,
    isEnabled: true,
    responseRate: 0.43,
    averageEngagementTime: 28 // seconds
  },
  {
    id: "ch1002",
    name: "SMS Notifications",
    type: "sms" as const,
    isEnabled: true,
    responseRate: 0.67,
    averageEngagementTime: 15 // seconds
  },
  {
    id: "ch1003",
    name: "Push Notifications",
    type: "push" as const,
    isEnabled: false,
    responseRate: 0.35,
    averageEngagementTime: 12 // seconds
  }
];

// Mock offer performance data for charts
export const offerPerformance = [
  {
    name: "10% Off",
    email: 5.2,
    sms: 4.8,
    push: 2.3,
    description: "10% discount on all products",
    aiDecision: 0.38, // AI confidence score for this offer
    lastSelectedCount: 42, // Number of times this was selected recently
    personalizedConversionRate: 8.7, // Conversion rate when personalized
    generalConversionRate: 3.5, // Conversion rate when not personalized
    customerSatisfactionScore: 4.3 // Out of 5
  },
  {
    name: "$15 Off",
    email: 6.1,
    sms: 5.4,
    push: 3.2,
    description: "$15 off orders over $75",
    aiDecision: 0.24,
    lastSelectedCount: 31,
    personalizedConversionRate: 9.5,
    generalConversionRate: 4.1,
    customerSatisfactionScore: 4.7
  },
  {
    name: "Bundle Offer",
    email: 4.3,
    sms: 5.9,
    push: 2.8,
    description: "Buy 2 get 1 free",
    aiDecision: 0.18,
    lastSelectedCount: 24,
    personalizedConversionRate: 7.4,
    generalConversionRate: 3.2,
    customerSatisfactionScore: 4.1
  },
  {
    name: "Free Shipping",
    email: 7.2,
    sms: 6.5,
    push: 4.1,
    description: "Free shipping on all orders",
    aiDecision: 0.16,
    lastSelectedCount: 19,
    personalizedConversionRate: 10.3,
    generalConversionRate: 5.2,
    customerSatisfactionScore: 4.9
  }
];

// Daily decisions made by the AI agent
export const aiDecisions = [
  { date: "2023-05-14", offersSent: 126, conversions: 28, revenue: 4250, personalizationScore: 0.75 },
  { date: "2023-05-15", offersSent: 158, conversions: 34, revenue: 5120, personalizationScore: 0.77 },
  { date: "2023-05-16", offersSent: 145, conversions: 32, revenue: 4890, personalizationScore: 0.79 },
  { date: "2023-05-17", offersSent: 172, conversions: 41, revenue: 6240, personalizationScore: 0.81 },
  { date: "2023-05-18", offersSent: 184, conversions: 45, revenue: 6850, personalizationScore: 0.82 },
  { date: "2023-05-19", offersSent: 196, conversions: 52, revenue: 7890, personalizationScore: 0.85 },
  { date: "2023-05-20", offersSent: 210, conversions: 59, revenue: 8750, personalizationScore: 0.87 },
];

// Live decision feed (simulated)
export const liveDecisionFeed = [
  { 
    timestamp: "2023-05-20T14:32:45Z", 
    customerId: "c10045", 
    customerSegment: "New Customer",
    selectedOffer: "10% Off First Purchase", 
    selectedChannel: "Email",
    probability: 0.82,
    status: "sent",
    personalizationFactors: ["First purchase", "Viewed product 3 times", "Abandoned cart"] 
  },
  { 
    timestamp: "2023-05-20T14:30:12Z", 
    customerId: "c29871", 
    customerSegment: "Returning Customer",
    selectedOffer: "Bundle Offer", 
    selectedChannel: "SMS",
    probability: 0.67,
    status: "converted",
    personalizationFactors: ["Previously purchased similar items", "High cart value", "Weekend shopper"] 
  },
  { 
    timestamp: "2023-05-20T14:28:57Z", 
    customerId: "c15632", 
    customerSegment: "High Value",
    selectedOffer: "Free Shipping", 
    selectedChannel: "Email",
    probability: 0.74,
    status: "sent",
    personalizationFactors: ["Price sensitive", "Multiple past purchases", "International location"] 
  },
  { 
    timestamp: "2023-05-20T14:26:33Z", 
    customerId: "c38211", 
    customerSegment: "At Risk",
    selectedOffer: "$15 Off $75+", 
    selectedChannel: "SMS",
    probability: 0.79,
    status: "converted",
    personalizationFactors: ["Last purchase 60+ days ago", "Previously responded to discounts", "Evening shopper"] 
  },
  { 
    timestamp: "2023-05-20T14:24:19Z", 
    customerId: "c22456", 
    customerSegment: "Loyal",
    selectedOffer: "Bundle Offer", 
    selectedChannel: "Push",
    probability: 0.45,
    status: "ignored",
    personalizationFactors: ["Premium product preference", "Frequent mobile app user", "Weekend shopper"] 
  }
];
