import React, { useEffect, useState } from 'react';
import { Button } from './button';
import { QuillPilotAPI } from '@/services/quillpilot-api';

interface PersonalizedRecommendationProps {
  userId: string;
}

export const PersonalizedRecommendation: React.FC<PersonalizedRecommendationProps> = ({ userId }) => {
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize API tracking
    QuillPilotAPI.initialize(userId);

    // Get initial recommendation
    const fetchRecommendation = async () => {
      try {
        setLoading(true);
        const decision = await QuillPilotAPI.getInstance().getDecision(userId, window.location.pathname);
        setRecommendation(decision);
      } catch (error) {
        console.error('Error fetching recommendation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendation();

    // Listen for route changes
    const handleRouteChange = () => {
      fetchRecommendation();
    };

    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [userId]);

  if (loading) {
    return <div className="p-4 bg-gray-800 rounded-lg text-white">Loading recommendation...</div>;
  }

  if (!recommendation) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md w-full p-4 bg-gray-800 rounded-lg shadow-lg text-white">
      <div className="mb-4">
        {recommendation.content}
      </div>
      {recommendation.actions && (
        <div className="flex flex-wrap gap-2">
          {recommendation.actions.map((action: any, index: number) => (
            <Button
              key={index}
              onClick={() => {
                // Handle action
                console.log('Action triggered:', action);
                // You can add navigation or other actions here
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {action.text}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
