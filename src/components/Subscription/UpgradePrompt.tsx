'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Crown, Star, Zap, Clock, ArrowRight } from 'lucide-react';
import { PricingSection } from '@/components/Payment/PricingSection';
import { planQueries } from '@/lib/db/queries';

interface UpgradePromptProps {
  userId: string;
  influencerId: string;
  influencerName: string;
  currentLevel: string;
  reason?: string;
  trigger?: React.ReactNode;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  interval: string;
  features: string[];
}

export function UpgradePrompt({ 
  userId, 
  influencerId, 
  influencerName, 
  currentLevel, 
  reason,
  trigger 
}: UpgradePromptProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/plans?influencerId=${influencerId}`);
      const data = await response.json();
      setPlans(data.plans || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    if (plans.length === 0) {
      fetchPlans();
    }
  };

  const getUpgradeReasons = () => {
    const reasons = [];
    
    switch (currentLevel) {
      case 'free':
        reasons.push(
          'Send unlimited messages',
          'Access exclusive content',
          'Priority responses',
          'Media message support'
        );
        break;
      case 'basic':
        reasons.push(
          'Unlimited daily messages',
          'Access exclusive content',
          'Higher response priority',
          'Voice message support'
        );
        break;
      case 'premium':
        reasons.push(
          'Instant responses',
          'Personalized content',
          'Direct access',
          'Analytics dashboard'
        );
        break;
    }
    
    return reasons;
  };

  const defaultTrigger = (
    <Card className="border-orange-200 bg-orange-50 cursor-pointer hover:bg-orange-100 transition-colors">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
          <Crown className="h-6 w-6 text-orange-600" />
        </div>
        <CardTitle className="text-xl">Upgrade Your Access</CardTitle>
        <CardDescription>
          {reason || `Unlock more features with ${influencerName}`}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <Badge variant="outline">
            Current: {currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)}
          </Badge>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-center">Upgrade to unlock:</h4>
          <ul className="text-sm space-y-1">
            {getUpgradeReasons().slice(0, 3).map((reason, index) => (
              <li key={index} className="flex items-center gap-2">
                <Star className="h-4 w-4 text-orange-500" />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        <Button className="w-full">
          <Crown className="mr-2 h-4 w-4" />
          View Plans
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={handleOpen}>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Your Plan for {influencerName}</DialogTitle>
          <DialogDescription>
            Select the plan that best fits your needs and unlock exclusive features
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <PricingSection 
              plans={plans}
              influencer={{ id: influencerId, displayName: influencerName }}
              userId={userId}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
