import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Check, Crown, Star } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Plan {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  interval: string;
  features: string[];
  access_level: string;
  is_popular?: boolean;
  stripe_price_id?: string;
  // Legacy support
  priceCents?: number;
  accessLevel?: string;
  isPopular?: boolean;
  stripePriceId?: string;
}

interface PurchaseButtonProps {
  plan?: Plan;
  influencerId?: string;
  onPurchaseSuccess?: () => void;
  className?: string;
}

export function PurchaseButton({ 
  plan, 
  influencerId, 
  onPurchaseSuccess,
  className = '' 
}: PurchaseButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle case where plan is not provided
  if (!plan) {
    return (
      <Card className={`relative ${className}`}>
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">No plans available</p>
        </CardContent>
      </Card>
    );
  }

  const handlePurchase = async () => {
    if (!influencerId) {
      setError('Influencer ID is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please sign in to purchase plans');
      }

      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          planId: plan.id,
          influencerId: influencerId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start purchase');
    } finally {
      setLoading(false);
    }
  };

  const getAccessLevelIcon = (accessLevel: string) => {
    switch (accessLevel) {
      case 'vip':
        return <Crown className="h-5 w-5" />;
      case 'premium':
        return <Star className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  const getAccessLevelColor = (accessLevel: string) => {
    switch (accessLevel) {
      case 'vip':
        return 'bg-purple-600';
      case 'premium':
        return 'bg-blue-600';
      default:
        return 'bg-green-600';
    }
  };

  const isPopular = plan.is_popular || plan.isPopular || false;
  const accessLevel = plan.access_level || plan.accessLevel || 'basic';
  const priceCents = plan.price_cents || plan.priceCents || 0;

  return (
    <Card className={`relative ${className}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
            Most Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center">
        <div className={`mx-auto w-12 h-12 rounded-full ${getAccessLevelColor(accessLevel)} flex items-center justify-center mb-4`}>
          {getAccessLevelIcon(accessLevel)}
        </div>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription className="text-gray-400">
          {plan.description}
        </CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold text-white">
            ${(priceCents / 100).toFixed(2)}
          </span>
          <span className="text-gray-400 ml-2">
            / {plan.interval}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {(() => {
            try {
              const features = Array.isArray(plan.features) 
                ? plan.features 
                : JSON.parse(plan.features || '[]');
              return features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </li>
              ));
            } catch (error) {
              console.error('Error parsing plan features:', error);
              return (
                <li className="text-gray-400 text-sm">
                  Features not available
                </li>
              );
            }
          })()}
        </ul>

        <Button
          onClick={handlePurchase}
          disabled={loading || !influencerId}
          className={`w-full ${isPopular ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold py-3 rounded-lg transition-all duration-200`}
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            `Subscribe to ${plan.name}`
          )}
        </Button>

        {error && (
          <div className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded">
            {error}
          </div>
        )}

        <p className="text-gray-400 text-xs text-center">
          Cancel anytime. No hidden fees.
        </p>
      </CardContent>
    </Card>
  );
}