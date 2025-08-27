import axios from 'axios';
import { Offer } from '@/components/offers/OfferManager';

const API_BASE_URL = 'http://localhost:3004/api';

export interface UserContext {
  userId: string;
  behavior: {
    currentScreen: string;
    timeOnPage: number;
    interactions: any[];
    lastVisit?: string;
    actions?: string[];
  };
  preferences: Record<string, any>;
  history: any[];
}

export interface Decision {
  type: 'offer' | 'message';
  content: string;
  offer?: Offer;
  actions: Array<{
    type: 'button';
    text: string;
    action: string;
  }>;
  metadata: {
    timestamp: string;
    screen: string;
    userId: string;
    isReturningUser?: boolean;
    isHighValueUser?: boolean;
    isBrowserUser?: boolean;
  };
}

export class QuillPilotAPI {
  private static instance: QuillPilotAPI;
  private readonly apiUrl: string;

  private constructor() {
    this.apiUrl = process.env.QUILLPILOT_API_URL || 'http://localhost:3004';
  }

  public static getInstance(): QuillPilotAPI {
    if (!QuillPilotAPI.instance) {
      QuillPilotAPI.instance = new QuillPilotAPI();
    }
    return QuillPilotAPI.instance;
  }

  async collectContext(userId: string, context: UserContext): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/collect-context`, {
        userId,
        context
      });
    } catch (error) {
      console.error('Error collecting context:', error);
      throw error;
    }
  }

  async getDecision(userId: string, currentScreen: string): Promise<Decision> {
    try {
      const response = await axios.post(`${API_BASE_URL}/get-decision`, {
        userId,
        currentScreen
      });
      return response.data;
    } catch (error) {
      console.error('Error getting decision:', error);
      throw error;
    }
  }

  static async collectEnhancedContext(userId: string, context: UserContext): Promise<void> {
    const instance = QuillPilotAPI.getInstance();
    try {
      const response = await fetch(`${instance.apiUrl}/api/collect-context`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, context }),
      });

      if (!response.ok) {
        throw new Error('Failed to collect context');
      }
    } catch (error) {
      console.error('Error collecting context:', error);
      throw error;
    }
  }

  static async getEnhancedDecision(userId: string, currentScreen: string): Promise<Decision> {
    const instance = QuillPilotAPI.getInstance();
    try {
      const response = await fetch(`${instance.apiUrl}/api/get-decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, currentScreen }),
      });

      if (!response.ok) {
        throw new Error('Failed to get decision');
      }

      const decision = await response.json();
      return decision;
    } catch (error) {
      console.error('Error getting decision:', error);
      throw error;
    }
  }

  static initialize(userId: string): void {
    // Initialize user context tracking
    window.addEventListener('load', () => {
      const api = QuillPilotAPI.getInstance();
      
      // Collect initial context
      api.collectContext(userId, {
        userId,
        behavior: {
          currentScreen: window.location.pathname,
          timeOnPage: 0,
          interactions: [],
          lastVisit: new Date().toISOString()
        },
        preferences: {},
        history: []
      }).catch(console.error);

      // Track user behavior
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'BUTTON' || target.tagName === 'A') {
          api.collectContext(userId, {
            userId,
            behavior: {
              currentScreen: window.location.pathname,
              timeOnPage: 0,
              interactions: [],
              actions: [target.textContent || target.getAttribute('href') || 'unknown']
            },
            preferences: {},
            history: []
          }).catch(console.error);
        }
      });
    });
  }
}
