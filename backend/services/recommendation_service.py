import numpy as np
from stable_baselines3 import PPO
import pandas as pd
import json
import sys

class RecommendationService:
    def __init__(self):
        self.model = None
        self.action_list = [
            ('discount', 10, 'email', 'immediate'),
            ('discount', 15, 'sms', 'immediate'),
            ('free_shipping', 0, 'email', 'next_day'),
            ('free_shipping', 0, 'push', 'immediate')
        ]
        self.load_model()

    def load_model(self):
        try:
            # Load the trained model with .zip extension
            self.model = PPO.load("models/agent_RL.zip")
        except Exception as e:
            print(json.dumps({
                "error": "Model loading failed",
                "details": str(e)
            }))
            self.model = None

    def prepare_state(self, features):
        """Convert customer features to model input state"""
        return np.array([
            float(features.get('recency', 0)),
            float(features.get('frequency', 0)),
            float(features.get('monetary_value', 0)),
            float(features.get('engagement_score', 0)),
            float(features.get('discount_sensitive', False)),
            float(features.get('free_shipping_preferred', False)),
            float(features.get('email_opens', 0)),
            float(features.get('sms_response', 0)),
            float(features.get('push_response', 0)),
            float(features.get('last_purchase_days', 0))
        ], dtype=np.float32).reshape(1, -1)

    def get_recommendation(self, features):
        """Get recommendation for a customer"""
        try:
            if self.model is None:
                # Fallback logic if model isn't loaded
                return self._get_fallback_recommendation(features)

            state = self.prepare_state(features)
            action, _ = self.model.predict(state, deterministic=True)
            
            # Convert action index to recommendation
            action_tuple = self.action_list[int(action)]
            
            return {
                'type': action_tuple[0],
                'value': action_tuple[1],
                'channel': action_tuple[2],
                'timing': action_tuple[3]
            }
        except Exception as e:
            print(json.dumps({
                "error": "Recommendation failed",
                "details": str(e)
            }))
            return self._get_fallback_recommendation(features)

    def _get_fallback_recommendation(self, features):
        """Fallback logic when model fails"""
        # Simple rule-based fallback
        if features.get('discount_sensitive', False):
            return {
                'type': 'discount',
                'value': 10,
                'channel': 'email',
                'timing': 'immediate'
            }
        else:
            return {
                'type': 'free_shipping',
                'value': 0,
                'channel': 'email',
                'timing': 'next_day'
            }

def main():
    try:
        # Get features from command line argument
        if len(sys.argv) < 2:
            print(json.dumps({
                "error": "Missing input",
                "details": "No features provided"
            }))
            sys.exit(1)

        # Parse features from command line
        features = json.loads(sys.argv[1])
        
        # Get recommendation
        service = RecommendationService()
        recommendation = service.get_recommendation(features)
        
        # Output recommendation as JSON
        print(json.dumps(recommendation))
        sys.exit(0)
    except json.JSONDecodeError as e:
        print(json.dumps({
            "error": "Invalid input",
            "details": f"Failed to parse input JSON: {str(e)}"
        }))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({
            "error": "Unexpected error",
            "details": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main() 