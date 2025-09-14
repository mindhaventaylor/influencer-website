'use client';

import { useState } from 'react';
import { PricingCard } from './PricingCard';
import { Plan, Influencer } from '@/lib/db/schema';
import { getStripe } from '@/lib/stripe';
import { toast } from 'sonner';

interface PricingSectionProps {
  plans: Plan[];
  influencer: Influencer;
  userId: string;
}

export function PricingSection({ plans, influencer, userId }: PricingSectionProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (planId: string) => {
    setIsLoading(true);
    
    try {
      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId,
          influencerId: influencer.id,
        }),
      });

      const { sessionId, error } = await response.json();

      if (error) {
        toast.error(error);
        return;
      }

      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      if (!stripe) {
        toast.error('Failed to load Stripe');
        return;
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        toast.error(stripeError.message || 'Failed to redirect to checkout');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to start subscription process');
    } finally {
      setIsLoading(false);
    }
  };

  if (plans.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No subscription plans available for {influencer.displayName}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Subscribe to {influencer.displayName}</h2>
        <p className="text-muted-foreground mt-2">
          Choose a plan to start chatting with {influencer.displayName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            influencerName={influencer.displayName}
            userId={userId}
            influencerId={influencer.id}
            onSubscribe={handleSubscribe}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}
