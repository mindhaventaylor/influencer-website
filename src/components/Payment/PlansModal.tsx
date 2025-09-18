'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getClientInfluencerInfo } from '@/lib/clientConfig';
import { supabase } from '@/lib/supabaseClient';

interface Plan {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  interval: string;
  features: string[];
  stripePriceId: string;
  isPopular?: boolean;
}

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlansModal({ isOpen, onClose }: PlansModalProps) {
  const { user } = useAuth();
  const influencer = getClientInfluencerInfo();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get plans from config instead of database
      const response = await fetch(`/api/plans-config?influencerId=${influencer.databaseId}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log('Fetched plans from config:', data.plans);
        setPlans(data.plans || []);
      } else {
        setError(data.error || 'Failed to fetch plans');
      }
    } catch (err) {
      setError('Failed to fetch plans');
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: Plan) => {
    if (!user) {
      setError('Please sign in to upgrade your plan');
      return;
    }

    setProcessingPlan(plan.id);
    setError(null);

    try {
      // Get the auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      const requestBody = {
        planId: plan.id,
        influencerId: influencer.databaseId,
      };

      console.log('Sending request body:', requestBody);
      console.log('Plan ID:', plan.id);
      console.log('Influencer Database ID:', influencer.databaseId);

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to create checkout session');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process upgrade');
      console.error('Error upgrading plan:', err);
    } finally {
      setProcessingPlan(null);
    }
  };

  const formatPrice = (priceCents: number, currency: string, interval: string) => {
    const price = (priceCents / 100).toFixed(2);
    return `$${price}/${interval}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80">
      <div className="bg-card rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-card-foreground">Choose Your Plan</h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-2 rounded-xl text-card-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-6">
            {typeof error === 'string' ? error : error.message || 'An error occurred'}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-card-foreground" />
            <span className="ml-2 text-card-foreground">Loading plans...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`p-6 rounded-xl border-2 transition-all ${
                  plan.isPopular 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border bg-secondary'
                }`}
              >
                {/* Plan Header */}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold mb-1 text-card-foreground">
                    {plan.name}
                  </h3>
                  <p className="text-sm mb-3 text-muted-foreground">
                    {plan.description}
                  </p>
                  <div className="text-2xl font-bold text-card-foreground">
                    {formatPrice(plan.priceCents, plan.currency, plan.interval)}
                  </div>
                  {plan.isPopular && (
                    <div className="text-xs font-medium mt-2 px-3 py-1 rounded-full inline-block bg-primary text-primary-foreground">
                      Most Popular
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Check className="w-4 h-4 flex-shrink-0 text-card-foreground" />
                      <span className="text-sm text-card-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Upgrade Button */}
                <Button
                  onClick={() => handleUpgrade(plan)}
                  disabled={processingPlan === plan.id}
                  className="w-full h-12 rounded-2xl font-semibold"
                  style={{ 
                    backgroundColor: plan.isPopular ? '#E84A4A' : '#2C2C2E',
                    color: '#EDEDED',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {processingPlan === plan.id ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </div>
                  ) : (
                    'Upgrade Now'
                  )}
                </Button>
              </div>
            ))}

            {plans.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No plans available at the moment.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
