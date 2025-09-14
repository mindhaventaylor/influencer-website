'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';
import { formatPrice, getIntervalText } from '@/lib/stripe';
import { Plan } from '@/lib/db/schema';

interface PricingCardProps {
  plan: Plan;
  influencerName: string;
  userId: string;
  influencerId: string;
  onSubscribe: (planId: string) => Promise<void>;
  isLoading?: boolean;
}

export function PricingCard({ 
  plan, 
  influencerName, 
  userId, 
  influencerId, 
  onSubscribe, 
  isLoading = false 
}: PricingCardProps) {
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      await onSubscribe(plan.id);
    } finally {
      setIsSubscribing(false);
    }
  };

  const features = plan.features as string[] || [];

  return (
    <Card className="relative w-full max-w-sm">
      {plan.isActive && (
        <Badge 
          variant="secondary" 
          className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white"
        >
          Popular
        </Badge>
      )}
      
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription className="text-gray-500">{plan.description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">{formatPrice(plan.priceCents, plan.currency)}</span>
          <span className="text-muted-foreground">/{getIntervalText(plan.interval)}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-4">
        <Button 
          className="w-full" 
          onClick={handleSubscribe}
          disabled={isSubscribing || isLoading}
        >
          {isSubscribing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Subscribe to ${influencerName}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
