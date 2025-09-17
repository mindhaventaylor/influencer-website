'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatPrice, getIntervalText } from '@/lib/stripe';
import { UserSubscription, Plan, Influencer } from '@/lib/db/schema';
import { toast } from 'sonner';

interface SubscriptionManagerProps {
  subscriptions: Array<{
    subscription: UserSubscription;
    plan: Plan;
    influencer: Influencer;
  }>;
  userId: string;
}

export function SubscriptionManager({ subscriptions, userId }: SubscriptionManagerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleManageSubscription = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const { url, error } = await response.json();

      if (error) {
        toast.error(error);
        return;
      }

      // Redirect to Stripe Customer Portal
      window.location.href = url;
    } catch (error) {
      console.error('Portal session error:', error);
      toast.error('Failed to open subscription management');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'trialing':
        return 'bg-blue-500';
      case 'past_due':
        return 'bg-yellow-500';
      case 'canceled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'trialing':
        return 'Trial';
      case 'past_due':
        return 'Past Due';
      case 'canceled':
        return 'Canceled';
      case 'unpaid':
        return 'Unpaid';
      case 'incomplete':
        return 'Incomplete';
      default:
        return status;
    }
  };

  if (subscriptions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Your Subscriptions</CardTitle>
          <CardDescription className="text-gray-500">You don't have any active subscriptions</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Subscriptions</h2>
          <p className="text-muted-foreground">
            Manage your subscription plans and billing
          </p>
        </div>
        <Button 
          onClick={handleManageSubscription} 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? 'Loading...' : 'Manage Billing'}
        </Button>
      </div>

      <div className="grid gap-4">
        {subscriptions.map(({ subscription, plan, influencer }) => (
          <Card key={subscription.id} className="w-full">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{influencer.displayName}</CardTitle>
                  <CardDescription className="text-gray-500">{plan.name}</CardDescription>
                </div>
                <Badge 
                  variant="secondary" 
                  className={getStatusColor(subscription.status)}
                >
                  {getStatusText(subscription.status)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Price</p>
                  <p className="font-medium">
                    {formatPrice(plan.priceCents, plan.currency)}/{getIntervalText(plan.interval)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Next billing</p>
                  <p className="font-medium">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="text-sm">
                <p className="text-muted-foreground">Subscription ID</p>
                <p className="font-mono text-xs">{subscription.stripeSubscriptionId}</p>
              </div>
              
              {subscription.cancelAtPeriodEnd && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    This subscription will be canceled at the end of the current billing period.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
