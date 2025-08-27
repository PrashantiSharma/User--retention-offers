
class RLAgent {
  constructor() {
    // Personalization parameters
    this.explorationRate = 0.1; // 10% chance to explore randomly
    this.explorationDecay = 0.995; // Decay exploration rate over time
    this.personalizedLearningRate = 0.15; // Learning rate for personalized decisions
    this.customerFeatureWeights = new Map(); // Weights for different customer features
    
    // Reward parameters
    this.rewardRates = {
      conversion: 1.0, // Base reward for conversion
      timeSpent: 0.1, // Reward for time spent on site
      engagement: 0.2, // Reward for user engagement
      customerSatisfaction: 0.3, // Reward for customer satisfaction
      repeat: 0.5 // Reward for repeat purchases
    };
    
    // State tracking
    this.customerPreferences = new Map(); // Store preferences by customer
    this.offerHistory = new Map(); // Store offer history
    this.rewardHistory = new Map(); // Store reward history
    this.personalizationScores = new Map(); // Track personalization accuracy
  }

  // Update exploration rate
  updateExplorationRate() {
    this.explorationRate *= this.explorationDecay;
    this.explorationRate = Math.max(0.01, this.explorationRate); // Minimum exploration rate
  }

  // Calculate reward based on user actions
  calculateReward(userContext) {
    let reward = 0;
    
    // Conversion reward
    if (userContext.conversion) {
      reward += this.rewardRates.conversion;
      
      // Additional reward for repeat purchases
      if (userContext.history && userContext.history.length > 0) {
        reward += this.rewardRates.repeat;
      }
    }
    
    // Time spent reward
    if (userContext.timeSpent) {
      reward += (userContext.timeSpent / 1000) * this.rewardRates.timeSpent; // Convert ms to s
    }
    
    // Engagement reward
    if (userContext.engagement) {
      reward += userContext.engagement * this.rewardRates.engagement;
    }
    
    // Customer satisfaction reward
    if (userContext.satisfaction) {
      reward += userContext.satisfaction * this.rewardRates.customerSatisfaction;
    }
    
    return reward;
  }

  // Extract customer features for personalization
  extractCustomerFeatures(userContext) {
    const features = {
      isReturningCustomer: userContext.history && userContext.history.length > 0,
      isHighValue: this.isHighValueCustomer(userContext),
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      deviceType: userContext.deviceType || 'desktop',
      location: userContext.location || 'unknown',
      lastPurchaseDays: this.getLastPurchaseDays(userContext),
      cartValue: userContext.cartValue || 0,
      viewedProducts: userContext.viewedProducts || 0
    };
    
    return features;
  }
  
  // Determine if customer is high value
  isHighValueCustomer(userContext) {
    if (!userContext.history) return false;
    
    const totalSpent = userContext.history.reduce((sum, action) => {
      return sum + (action.type === 'purchase' ? (action.value || 0) : 0);
    }, 0);
    
    return totalSpent > 200; // Customer has spent more than $200
  }
  
  // Get days since last purchase
  getLastPurchaseDays(userContext) {
    if (!userContext.history || userContext.history.length === 0) return 999;
    
    const purchases = userContext.history.filter(action => action.type === 'purchase');
    if (purchases.length === 0) return 999;
    
    const lastPurchaseDate = new Date(purchases[purchases.length - 1].timestamp);
    const daysSince = Math.floor((new Date() - lastPurchaseDate) / (1000 * 60 * 60 * 24));
    
    return daysSince;
  }

  // Choose offer based on personalization
  chooseOffer(userId, availableOffers, userContext) {
    // Extract customer features for personalization
    const customerFeatures = this.extractCustomerFeatures(userContext);
    
    // Store customer preferences
    this.updateCustomerPreferences(userId, customerFeatures);
    
    // Exploration vs Exploitation
    if (Math.random() < this.explorationRate) {
      // Explore: Choose random offer
      return availableOffers[Math.floor(Math.random() * availableOffers.length)];
    } else {
      // Exploit: Choose best personalized offer
      return this.getBestPersonalizedOffer(userId, customerFeatures, availableOffers);
    }
  }

  // Update customer preferences based on interactions
  updateCustomerPreferences(userId, features) {
    const existingPrefs = this.customerPreferences.get(userId) || {};
    
    // Update preferences based on new features
    const updatedPrefs = {
      ...existingPrefs,
      lastSeen: new Date().toISOString(),
      features: {
        ...existingPrefs.features,
        ...features
      }
    };
    
    this.customerPreferences.set(userId, updatedPrefs);
  }

  // Get best personalized offer
  getBestPersonalizedOffer(userId, features, availableOffers) {
    let bestOffer = null;
    let highestScore = -1;
    
    for (const offer of availableOffers) {
      // Calculate personalization score for this offer
      const score = this.calculatePersonalizationScore(userId, offer, features);
      
      if (score > highestScore) {
        highestScore = score;
        bestOffer = offer;
      }
    }
    
    // Record personalization attempt
    this.personalizationScores.set(`${userId}:${bestOffer.id}`, highestScore);
    
    return bestOffer;
  }
  
  // Calculate personalization score for an offer
  calculatePersonalizationScore(userId, offer, features) {
    // Base score
    let score = 0.5;
    
    // Adjust score based on customer features
    if (features.isReturningCustomer && offer.id === 'o1004') {
      // Returning customers often prefer free shipping
      score += 0.1;
    }
    
    if (features.isHighValue && offer.id === 'o1002') {
      // High value customers often respond well to dollar-amount discounts
      score += 0.15;
    }
    
    if (features.lastPurchaseDays > 30 && offer.id === 'o1002') {
      // Customers who haven't purchased recently respond to dollar discounts
      score += 0.2;
    }
    
    if (!features.isReturningCustomer && offer.id === 'o1001') {
      // New customers respond well to percentage discounts
      score += 0.2;
    }
    
    if (features.cartValue > 50 && offer.id === 'o1003') {
      // Customers with higher cart values respond to bundle offers
      score += 0.15;
    }
    
    // Consider previous reward history for this user-offer combination
    const offerKey = `${userId}:${offer.id}`;
    const previousReward = this.rewardHistory.get(offerKey) || 0;
    
    // Adjust score based on previous rewards
    score += previousReward * 0.3;
    
    return Math.min(1, Math.max(0, score)); // Keep score between 0 and 1
  }

  // Update offer performance with reward
  updateOfferPerformance(userId, offer, reward) {
    // Store the reward for this offer
    const offerKey = `${userId}:${offer.id}`;
    const currentReward = this.rewardHistory.get(offerKey) || 0;
    const newReward = currentReward * (1 - this.personalizedLearningRate) + reward * this.personalizedLearningRate;
    this.rewardHistory.set(offerKey, newReward);
    
    // Update exploration rate
    this.updateExplorationRate();
    
    // Log the personalization performance
    console.log(`Personalization performance for ${userId}:${offer.id} = ${newReward.toFixed(2)}`);
  }
}

export default RLAgent;
