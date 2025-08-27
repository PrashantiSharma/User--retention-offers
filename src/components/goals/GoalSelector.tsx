
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export type BusinessGoal = 'aov' | 'repeatPurchase' | 'customerRetention' | 'clv';

interface GoalSelectorProps {
  onGoalSelected: (goal: BusinessGoal) => void;
  selectedGoal?: BusinessGoal;
}

const GoalSelector: React.FC<GoalSelectorProps> = ({ onGoalSelected, selectedGoal }) => {
  const [goal, setGoal] = useState<BusinessGoal>(selectedGoal || 'aov');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGoalSelected(goal);
  };
  
  return (
    <Card className="w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Select Your Business Goal</CardTitle>
          <CardDescription>
            Choose the primary metric you want to improve. Our AI will optimize your offers accordingly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={goal} onValueChange={(value) => setGoal(value as BusinessGoal)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="aov" id="aov" />
              <Label htmlFor="aov" className="flex flex-col">
                <span className="font-medium">Maximize Average Order Value</span>
                <span className="text-sm text-muted-foreground">Increase the average amount customers spend per order</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="repeatPurchase" id="repeatPurchase" />
              <Label htmlFor="repeatPurchase" className="flex flex-col">
                <span className="font-medium">Increase Repeat Purchases</span>
                <span className="text-sm text-muted-foreground">Get customers to purchase more frequently</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="customerRetention" id="customerRetention" />
              <Label htmlFor="customerRetention" className="flex flex-col">
                <span className="font-medium">Improve Customer Retention</span>
                <span className="text-sm text-muted-foreground">Reduce customer churn and increase loyalty</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="clv" id="clv" />
              <Label htmlFor="clv" className="flex flex-col">
                <span className="font-medium">Maximize Customer Lifetime Value</span>
                <span className="text-sm text-muted-foreground">Focus on long-term value from your customers</span>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">Set Business Goal</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default GoalSelector;
