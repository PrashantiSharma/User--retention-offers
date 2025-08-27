
// Mock reinforcement learning agent data
export const agent = {
  algorithm: "ThompsonSampling",
  arms: [
    { id: "arm1", name: "10% Off + Email", successCount: 42, failureCount: 68, probability: 0.38 },
    { id: "arm2", name: "Bundle Offer + SMS", successCount: 35, failureCount: 112, probability: 0.24 },
    { id: "arm3", name: "Free Shipping + Email", successCount: 30, failureCount: 137, probability: 0.18 },
    { id: "arm4", name: "$15 Off + SMS", successCount: 28, failureCount: 152, probability: 0.16 },
    { id: "arm5", name: "10% Off + Push", successCount: 5, failureCount: 195, probability: 0.04 }
  ],
  parameters: {
    explorationRate: 0.15,
    learningRate: 0.05,
    recencyWeight: 0.8
  },
  createdAt: "2023-05-01T00:00:00Z",
  lastTrainingDate: "2023-05-19T14:30:00Z"
};

// Mock learning progress data for charts
export const learningProgress = [
  { day: 1, rewardRate: 0.12, explorationRate: 0.50 },
  { day: 5, rewardRate: 0.15, explorationRate: 0.45 },
  { day: 10, rewardRate: 0.19, explorationRate: 0.40 },
  { day: 15, rewardRate: 0.22, explorationRate: 0.35 },
  { day: 20, rewardRate: 0.24, explorationRate: 0.30 },
  { day: 25, rewardRate: 0.28, explorationRate: 0.25 },
  { day: 30, rewardRate: 0.31, explorationRate: 0.20 },
  { day: 35, rewardRate: 0.34, explorationRate: 0.15 },
  { day: 40, rewardRate: 0.36, explorationRate: 0.15 },
  { day: 45, rewardRate: 0.38, explorationRate: 0.15 }
];
