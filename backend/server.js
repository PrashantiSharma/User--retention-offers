import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import RLAgent from './rl-agent.js';
import shopifyService from './services/shopify-service.js';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import twilio from 'twilio';
import { config } from 'dotenv';

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 3004;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize RL agent
const rlAgent = new RLAgent();

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
const userContexts = new Map();
const userProfiles = new Map();
const decisions = new Map();
const personalizationMetrics = {
  totalDecisions: 0,
  conversions: 0,
  averageRelevanceScore: 0.0
};

// Mock offers data
const offers = [
  {
    id: "o1001",
    name: "10% Off First Purchase",
    type: "percentage",
    value: 10,
    description: "10% discount for first-time customers"
  },
  {
    id: "o1002",
    name: "$15 Off $75+",
    type: "fixed",
    value: 15,
    description: "$15 discount on orders over $75"
  },
  {
    id: "o1003",
    name: "Buy 2 Get 1 Free",
    type: "bundle",
    value: 3,
    description: "Buy 2 items, get 1 free (equal or lesser value)"
  },
  {
    id: "o1004",
    name: "Free Shipping",
    type: "freeShipping",
    value: 0,
    description: "Free shipping on all orders"
  }
];

// API endpoint to collect user context
app.post('/api/collect-context', async (req, res) => {
  try {
    const { userId, context } = req.body;
    
    // Enrich context with personalization data
    const enrichedContext = {
      ...context,
      lastUpdated: new Date().toISOString(),
      personalizationScore: calculatePersonalizationScore(userId, context)
    };
    
    // Store context in memory
    userContexts.set(userId, enrichedContext);
    
    // Update user profile
    updateUserProfile(userId, context);
    
    res.status(200).json({ 
      message: 'Context collected successfully',
      personalizationScore: enrichedContext.personalizationScore
    });
  } catch (error) {
    console.error('Error collecting context:', error);
    res.status(500).json({ error: 'Failed to collect context' });
  }
});

// API endpoint to get personalized decision
app.post('/api/get-decision', async (req, res) => {
  try {
    const { userId, currentScreen } = req.body;
    
    // Get user context
    const userContext = userContexts.get(userId);
    if (!userContext) {
      return res.status(404).json({ error: 'User context not found' });
    }

    // Get personalized decision using RL agent
    const decision = await makePersonalizedDecision(userId, userContext, currentScreen);
    
    // Track metrics
    personalizationMetrics.totalDecisions++;
    
    res.status(200).json(decision);
  } catch (error) {
    console.error('Error getting decision:', error);
    res.status(500).json({ error: 'Failed to get decision' });
  }
});

// API endpoint to update reward
app.post('/api/update-reward', async (req, res) => {
  try {
    const { userId, offerId, reward, didConvert } = req.body;
    
    // Update offer performance
    rlAgent.updateOfferPerformance(userId, { id: offerId }, reward);
    
    // Track conversion metrics
    if (didConvert) {
      personalizationMetrics.conversions++;
    }
    
    // Update personalization score
    const userContext = userContexts.get(userId);
    if (userContext) {
      userContext.personalizationScore = calculatePersonalizationScore(userId, userContext);
      userContexts.set(userId, userContext);
    }
    
    res.status(200).json({ 
      message: 'Reward updated successfully',
      currentMetrics: {
        conversionRate: personalizationMetrics.conversions / personalizationMetrics.totalDecisions,
        averageRelevanceScore: personalizationMetrics.averageRelevanceScore
      }
    });
  } catch (error) {
    console.error('Error updating reward:', error);
    res.status(500).json({ error: 'Failed to update reward' });
  }
});

// API endpoint to get personalization metrics
app.get('/api/metrics', (req, res) => {
  res.status(200).json({
    totalDecisions: personalizationMetrics.totalDecisions,
    conversions: personalizationMetrics.conversions,
    conversionRate: personalizationMetrics.totalDecisions ? 
      (personalizationMetrics.conversions / personalizationMetrics.totalDecisions) : 0,
    averageRelevanceScore: personalizationMetrics.averageRelevanceScore
  });
});

// Function to update user profile with new context data
function updateUserProfile(userId, context) {
  const currentProfile = userProfiles.get(userId) || {
    userId,
    firstSeen: new Date().toISOString(),
    interactions: 0,
    purchases: 0,
    totalSpent: 0,
    preferences: {}
  };
  
  // Update profile with new information
  currentProfile.lastSeen = new Date().toISOString();
  currentProfile.interactions++;
  
  // Track purchases
  if (context.purchase) {
    currentProfile.purchases++;
    currentProfile.totalSpent += (context.purchase.value || 0);
  }
  
  // Track preferences
  if (context.preferredCategories) {
    currentProfile.preferences.categories = context.preferredCategories;
  }
  
  if (context.preferredBrands) {
    currentProfile.preferences.brands = context.preferredBrands;
  }
  
  userProfiles.set(userId, currentProfile);
}

// Calculate personalization score based on user context
function calculatePersonalizationScore(userId, context) {
  const profile = userProfiles.get(userId);
  if (!profile) return 0.5; // Default score
  
  // Simple scoring based on profile completeness
  let score = 0.5;
  
  // More interactions = better personalization
  score += Math.min(0.2, profile.interactions * 0.01);
  
  // More purchases = better understanding of user
  score += Math.min(0.2, profile.purchases * 0.05);
  
  // More preferences = better personalization
  if (profile.preferences.categories) score += 0.05;
  if (profile.preferences.brands) score += 0.05;
  
  // Update global average
  personalizationMetrics.averageRelevanceScore = 
    (personalizationMetrics.averageRelevanceScore * (personalizationMetrics.totalDecisions || 1) + score) / 
    ((personalizationMetrics.totalDecisions || 1) + 1);
  
  return Math.min(1, score);
}

// Function to make personalized decisions using RL agent
async function makePersonalizedDecision(userId, context, currentScreen) {
  // Get available offers
  const availableOffers = offers;
  
  // Choose offer using RL agent
  const selectedOffer = rlAgent.chooseOffer(userId, availableOffers, context);
  
  // Determine best channel based on user profile
  const userProfile = userProfiles.get(userId) || {};
  let selectedChannel = "email"; // Default
  
  if (context.mobile) {
    selectedChannel = "sms"; // SMS for mobile users
  } else if (context.appInstalled) {
    selectedChannel = "push"; // Push for app users
  }
  
  // Extract personalization factors
  const personalizationFactors = extractPersonalizationFactors(context, selectedOffer);
  
  // Create decision
  const decision = {
    type: 'offer',
    content: `Personalized offer just for you based on your preferences!`,
    offer: selectedOffer,
    channel: selectedChannel,
    actions: [
      { type: 'button', text: 'Apply Offer', action: 'apply-offer' },
      { type: 'button', text: 'View More', action: 'view-offers' }
    ],
    metadata: {
      timestamp: new Date().toISOString(),
      screen: currentScreen,
      userId,
      personalizationScore: calculatePersonalizationScore(userId, context),
      personalizationFactors,
      isReturningUser: userProfile.purchases > 0,
      isHighValueUser: (userProfile.totalSpent || 0) > 200,
      relevanceConfidence: 0.85
    }
  };

  // Store decision for analytics
  const decisionId = uuidv4();
  decisions.set(decisionId, {
    userId,
    decision,
    timestamp: new Date().toISOString()
  });

  return decision;
}

// Extract factors used for personalization
function extractPersonalizationFactors(context, selectedOffer) {
  const factors = [];
  
  // These would normally be extracted from actual user data
  if (!context.purchases || context.purchases.length === 0) {
    factors.push("First-time customer");
  } else {
    factors.push("Returning customer");
  }
  
  if (context.cartAbandoned) {
    factors.push("Recently abandoned cart");
  }
  
  if (context.browsedProducts && context.browsedProducts > 3) {
    factors.push("Multiple product views");
  }
  
  if (context.evening) {
    factors.push("Evening shopper");
  }
  
  if (context.weekend) {
    factors.push("Weekend shopper");
  }
  
  // Add offer-specific factors
  if (selectedOffer.id === "o1001" && factors.includes("First-time customer")) {
    factors.push("First purchase discount");
  }
  
  if (selectedOffer.id === "o1002" && context.cartValue && context.cartValue > 60) {
    factors.push("Cart value near threshold");
  }
  
  if (selectedOffer.id === "o1004" && context.distanceToStore && context.distanceToStore > 20) {
    factors.push("Located far from physical store");
  }
  
  return factors.slice(0, 3); // Return top 3 factors
}

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'OfferFit API is running',
    personalizationMetrics: {
      decisions: personalizationMetrics.totalDecisions,
      conversions: personalizationMetrics.conversions,
      conversionRate: personalizationMetrics.totalDecisions ? 
        (personalizationMetrics.conversions / personalizationMetrics.totalDecisions).toFixed(2) : 0
    }
  });
});

// Simple frontend route for testing
app.get('/test', (req, res) => {
  res.json({
    message: 'Welcome to OfferFit API - Personalized Offers for Shopify',
    endpoints: {
      'collect-context': '/api/collect-context (POST)',
      'get-decision': '/api/get-decision (POST)',
      'update-reward': '/api/update-reward (POST)',
      'metrics': '/api/metrics (GET)'
    }
  });
});

// Shopify Integration Routes
app.post('/api/shopify/connect', async (req, res) => {
  try {
    const { shopUrl, accessToken } = req.body;
    
    if (!shopUrl || !accessToken) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        details: 'Both shopUrl and accessToken are required'
      });
    }

    // Validate shop URL format
    if (!shopifyService.constructor.validateShopUrl(shopUrl)) {
      return res.status(400).json({ 
        error: 'Invalid shop URL',
        details: 'Shop URL must be in the format: your-store.myshopify.com'
      });
    }

    // Validate access token format
    if (!shopifyService.constructor.validateAccessToken(accessToken)) {
      return res.status(400).json({ 
        error: 'Invalid access token',
        details: 'Access token must be in the format: shpat_xxxxx...'
      });
    }

    const shop = await shopifyService.initializeStore(shopUrl, accessToken);
    
    res.status(200).json({ 
      message: 'Successfully connected to Shopify store',
      shop
    });
  } catch (error) {
    console.error('Error connecting to Shopify:', error);
    res.status(500).json({ 
      error: 'Failed to connect to Shopify store',
      details: error.message
    });
  }
});

app.get('/api/shopify/customers', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    if (!shopifyService.isInitialized) {
      return res.status(401).json({ 
        error: 'Not connected to Shopify',
        details: 'Please connect to a Shopify store first'
      });
    }

    const customers = await shopifyService.getCustomers(parseInt(page), parseInt(limit));
    
    res.status(200).json({ 
      customers,
      pagination: {
        currentPage: parseInt(page),
        limit: parseInt(limit),
        hasMore: Boolean(shopifyService.nextPageUrl)
      }
    });
  } catch (error) {
    console.error('Error fetching Shopify customers:', error);
    const errorMessage = error.message || 'Unknown error occurred';
    res.status(error.message.includes('not initialized') ? 401 : 500).json({ 
      error: 'Failed to fetch customers',
      details: errorMessage
    });
  }
});

app.get('/api/shopify/customers/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    if (!shopifyService.isInitialized) {
      return res.status(401).json({ 
        error: 'Not connected to Shopify',
        details: 'Please connect to a Shopify store first'
      });
    }

    const customers = await shopifyService.getCustomers();
    const customer = customers.find(c => c.id === customerId);

    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found',
        details: `No customer found with ID: ${customerId}`
      });
    }

    // Get additional metrics
    const metrics = await shopifyService.getCustomerMetrics(customerId);
    customer.metrics = { ...customer.metrics, ...metrics };

    res.status(200).json({ customer });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ 
      error: 'Failed to fetch customer',
      details: error.message
    });
  }
});

app.get('/api/shopify/customers/:customerId/metrics', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    if (!shopifyService.isInitialized) {
      return res.status(401).json({ 
        error: 'Not connected to Shopify',
        details: 'Please connect to a Shopify store first'
      });
    }

    const metrics = await shopifyService.getCustomerMetrics(customerId);
    res.status(200).json({ metrics });
  } catch (error) {
    console.error('Error fetching customer metrics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch customer metrics',
      details: error.message
    });
  }
});

// Recommendation endpoint
app.post('/api/recommend', async (req, res) => {
  try {
    const features = req.body;
    
    // Call Python script for recommendation
    const pythonProcess = spawn('python', [
      join(__dirname, 'services', 'recommendation_service.py'),
      JSON.stringify(features)
    ]);

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      try {
        // Try to parse the output as JSON
        const output = result.trim();
        if (!output) {
          throw new Error('No output from recommendation service');
        }

        const jsonResult = JSON.parse(output);
        
        // Check if the result contains an error
        if (jsonResult.error) {
          res.status(500).json(jsonResult);
          return;
        }

        // Return the recommendation
        res.status(200).json(jsonResult);
      } catch (e) {
        console.error('Error processing recommendation:', e);
        console.error('Python script output:', result);
        console.error('Python script error:', error);
        
        res.status(500).json({ 
          error: 'Failed to process recommendation',
          details: e.message,
          pythonError: error || undefined
        });
      }
    });

    pythonProcess.on('error', (err) => {
      console.error('Failed to start Python process:', err);
      res.status(500).json({ 
        error: 'Failed to start recommendation service',
        details: err.message
      });
    });
  } catch (error) {
    console.error('Error in recommendation endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to process recommendation request',
      details: error.message
    });
  }
});

// WhatsApp endpoint
app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const { to, offer } = req.body;

    if (!to || !offer) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Format the offer message based on type
    let offerText = '';
    switch (offer.type) {
      case 'percentage':
        offerText = `${offer.value}% off`;
        break;
      case 'fixed':
        offerText = `$${offer.value} off`;
        break;
      case 'bundle':
        offerText = `Buy ${offer.value} items deal`;
        break;
      case 'freeShipping':
        offerText = 'Free shipping';
        break;
      default:
        offerText = offer.description;
    }

    // Format the message
    const message = `🎉 Special Offer from Our Store!\n\n${offer.name}\n\n${offerText}\n\n${offer.description}\n\nClick here to redeem: [Store URL]`;

    // Ensure both numbers have whatsapp: prefix
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const formattedFrom = twilioPhoneNumber.startsWith('whatsapp:') ? twilioPhoneNumber : `whatsapp:${twilioPhoneNumber}`;

    // Send WhatsApp message using Twilio
    const twilioMessage = await client.messages.create({
      body: message,
      from: formattedFrom,
      to: formattedTo
    });

    return res.status(200).json({
      success: true,
      messageId: twilioMessage.sid
    });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send WhatsApp message'
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`OfferFit API server running on port ${port}`);
});
