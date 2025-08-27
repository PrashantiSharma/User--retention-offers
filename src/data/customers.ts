
// Mock customer data
export const customers = [
  {
    id: "c1001",
    email: "sarah@example.com",
    firstName: "Sarah",
    lastName: "Johnson",
    totalSpent: 432.10,
    ordersCount: 7,
    lastOrderDate: "2023-04-12T14:32:00Z",
    segment: "loyal"
  },
  {
    id: "c1002",
    email: "michael@example.com",
    firstName: "Michael",
    lastName: "Smith",
    totalSpent: 89.50,
    ordersCount: 1,
    lastOrderDate: "2023-05-01T09:15:00Z",
    segment: "new"
  },
  {
    id: "c1003",
    email: "emma@example.com",
    firstName: "Emma",
    lastName: "Davis",
    totalSpent: 267.80,
    ordersCount: 4,
    lastOrderDate: "2023-03-22T16:45:00Z",
    segment: "returning"
  },
  {
    id: "c1004",
    email: "john@example.com",
    firstName: "John",
    lastName: "Wilson",
    totalSpent: 742.30,
    ordersCount: 12,
    lastOrderDate: "2023-05-05T11:20:00Z",
    segment: "vip"
  },
  {
    id: "c1005",
    email: "amanda@example.com",
    firstName: "Amanda",
    lastName: "Brown",
    totalSpent: 63.25,
    ordersCount: 1,
    lastOrderDate: "2023-02-18T10:05:00Z",
    segment: "at_risk"
  }
];

// Customer segments for charts
export const customerSegments = [
  {
    name: "New",
    value: 35,
    metrics: { aov: 52.30, purchaseFrequency: 1.0, clv: 52.30 }
  },
  {
    name: "Returning",
    value: 25,
    metrics: { aov: 68.75, purchaseFrequency: 1.5, clv: 206.25 }
  },
  {
    name: "Loyal",
    value: 20,
    metrics: { aov: 75.20, purchaseFrequency: 2.2, clv: 496.30 }
  },
  {
    name: "VIP",
    value: 10,
    metrics: { aov: 120.40, purchaseFrequency: 3.0, clv: 1083.60 }
  },
  {
    name: "At Risk",
    value: 10,
    metrics: { aov: 60.85, purchaseFrequency: 0.5, clv: 182.55 }
  }
];
