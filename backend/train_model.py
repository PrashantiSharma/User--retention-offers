import numpy as np
import gymnasium as gym
from gymnasium import spaces
from stable_baselines3 import PPO
from stable_baselines3.common.vec_env import DummyVecEnv
import pandas as pd
import os

class RecommendationEnv(gym.Env):
    """Fixed recommendation environment"""
    
    metadata = {'render_modes': ['console'], 'render_fps': 4}
    
    def __init__(self, user_data, action_list, render_mode=None):
        super().__init__()
        self.feature_names = [
            'recency',
            'frequency', 
            'monetary_value',
            'engagement_score',
            'discount_sensitive',
            'free_shipping_preferred',
            'email_opens',
            'sms_response',
            'push_response',
            'last_purchase_days'
        ]
        self.user_data = user_data
        self.action_list = action_list
        self.current_user_idx = 0
        
        # Define spaces
        self.action_space = spaces.Discrete(len(action_list))
        self.observation_space = spaces.Box(low=-np.inf, high=np.inf, shape=(10,), dtype=np.float32)
        self.render_mode = render_mode

    def reset(self, seed=None, options=None):
        """Proper reset implementation"""
        super().reset(seed=seed)
        self.current_user_idx = 0
        return self._get_state(self.current_user_idx), {}

    def step(self, action):
        """Fixed step implementation"""
        # Convert action to scalar if it's an array
        if isinstance(action, (np.ndarray, list)):
            action = action[0]
            
        reward = self._calculate_reward(action)
        self.current_user_idx += 1
        terminated = self.current_user_idx >= len(self.user_data)
        
        next_state = (self._get_state(self.current_user_idx) 
                    if not terminated 
                    else np.zeros(self.observation_space.shape, dtype=np.float32))
        
        return next_state, float(reward), terminated, False, {}

    def _get_state(self, user_idx):
        """Safe state generation"""
        user = self.user_data.iloc[user_idx]
        return np.array([
            float(user.get('recency', 0)),
            float(user.get('frequency', 0)),
            float(user.get('monetary_value', 0)),
            float(user.get('engagement_score', 0)),
            float(user.get('discount_sensitive', False)),
            float(user.get('free_shipping_preferred', False)),
            float(user.get('email_opens', 0)),
            float(user.get('sms_response', 0)),
            float(user.get('push_response', 0)),
            float(user.get('last_purchase_days', 0))
        ], dtype=np.float32)

    def _calculate_reward(self, action_idx):
        """Robust reward calculation"""
        user = self.user_data.iloc[self.current_user_idx]
        action = self.action_list[action_idx]
        
        reward = 0.1
        if action[0] == 'discount' and user.get('discount_sensitive', False):
            reward += 0.5
        if action[2] == 'email' and user.get('email_opens', 0) > 0.5:
            reward += 0.3
            
        return min(max(reward, 0), 1)  # Clip to [0,1]

    def format_state(self, state_values):
        return "\n".join([f"{name}: {value:.2f}" for name, value in zip(self.feature_names, state_values)])

def main():
    # Create models directory if it doesn't exist
    os.makedirs('models', exist_ok=True)

    # 1. Generate realistic sample data
    num_users = 100
    user_data = pd.DataFrame({
        'recency': np.random.randint(1, 30, num_users),
        'frequency': np.random.randint(1, 10, num_users),
        'monetary_value': np.random.uniform(10, 200, num_users),
        'engagement_score': np.random.uniform(0, 1, num_users),
        'discount_sensitive': np.random.random(num_users) > 0.7,
        'free_shipping_preferred': np.random.random(num_users) > 0.7,
        'email_opens': np.random.uniform(0, 1, num_users),
        'sms_response': np.random.uniform(0, 1, num_users),
        'push_response': np.random.uniform(0, 1, num_users),
        'last_purchase_days': np.random.randint(1, 90, num_users)
    })
    
    # 2. Define simplified action space
    action_list = [
        ('discount', 10, 'email', 'immediate'),
        ('discount', 15, 'sms', 'immediate'),
        ('free_shipping', 0, 'email', 'next_day'),
        ('free_shipping', 0, 'push', 'immediate')
    ]
    
    # 3. Create and wrap environment
    env = DummyVecEnv([lambda: RecommendationEnv(user_data, action_list)])
    
    # 4. Train with robust settings
    model = PPO(
        "MlpPolicy",
        env,
        verbose=1,
        learning_rate=3e-4,
        n_steps=2048,
        batch_size=64,
        n_epochs=10,
        gamma=0.99,
        clip_range=0.2
    )
    
    # Train in smaller chunks
    model.learn(total_timesteps=1000)

    # Save the model in the correct format
    model_path = os.path.join('models', 'agent_RL.zip')
    model.save(model_path)
    print(f"Model saved to {model_path}")

    # Test the saved model
    loaded_model = PPO.load(model_path)
    test_users = user_data.sample(5)
    
    print("\nTesting loaded model:")
    for idx, user in test_users.iterrows():
        try:
            # Get state directly from the underlying environment
            state = env.envs[0]._get_state(idx)
            
            # Ensure proper shape for prediction
            if state.ndim == 1:
                state = state.reshape(1, -1)
                
            action, _ = loaded_model.predict(state, deterministic=True)
            
            # Handle action output properly
            if isinstance(action, np.ndarray):
                action = action[0]
                
            print(f"\nUser {idx} recommendation: {action_list[action]}")
            print("State features:")
            print(env.envs[0].format_state(state.flatten()))
            
        except Exception as e:
            print(f"Error processing user {idx}: {str(e)}")

if __name__ == "__main__":
    main() 