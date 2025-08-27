
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { learningProgress } from '@/data/agent';
import { Badge } from '../ui/badge';

const LearningProgress: React.FC = () => {
  return (
    <div className="grid gap-4">
      <Card className="col-span-3">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>AI Learning Progress</CardTitle>
              <CardDescription>
                How the reinforcement learning agent is improving over time
              </CardDescription>
            </div>
            <Badge variant="outline" className="ml-2">
              Multi-Armed Bandit Algorithm
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={learningProgress}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="rewardRate"
                name="Reward Rate"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
              <Line yAxisId="right" type="monotone" dataKey="explorationRate" name="Exploration Rate" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>RL Agent Summary</CardTitle>
          <CardDescription>
            Current state of the reinforcement learning agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium">Top Arm Selections</h4>
              <ul className="mt-2 space-y-2">
                <li className="flex justify-between items-center">
                  <span className="text-sm">10% Off + Email</span>
                  <span className="text-sm font-medium">38%</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-sm">Bundle Offer + SMS</span>
                  <span className="text-sm font-medium">24%</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-sm">Free Shipping + Email</span>
                  <span className="text-sm font-medium">18%</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium">Agent Parameters</h4>
              <ul className="mt-2 space-y-2">
                <li className="flex justify-between items-center">
                  <span className="text-sm">Algorithm</span>
                  <span className="text-sm font-medium">Thompson Sampling</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-sm">Current Exploration</span>
                  <span className="text-sm font-medium">0.15</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-sm">Learning Rate</span>
                  <span className="text-sm font-medium">0.05</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningProgress;
