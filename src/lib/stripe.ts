import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';
import { getInfluencerConfig } from './config';

// Get Stripe configuration from influencer config
const getStripeConfig = () => {
  const config = getInfluencerConfig();
  return config.stripe;
};

// Server-side Stripe instance
export const stripe = new Stripe(getStripeConfig().secretKey, {
  apiVersion: '2024-06-20',
  typescript: true,
});

// Client-side Stripe instance
export const getStripe = () => {
  return loadStripe(getStripeConfig().publishableKey);
};

// Stripe configuration
export const STRIPE_CONFIG = {
  currency: 'usd',
  mode: 'subscription' as const,
  successUrl: `${getInfluencerConfig().deployment?.baseUrl || 'http://localhost:3003'}/payment/success`,
  cancelUrl: `${getInfluencerConfig().deployment?.baseUrl || 'http://localhost:3003'}/payment/cancel`,
};

// Helper function to format price for display
export const formatPrice = (amountInCents: number, currency: string = 'usd'): string => {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
};

// Helper function to get interval display text
export const getIntervalText = (interval: string, intervalCount: number = 1): string => {
  if (intervalCount === 1) {
    switch (interval) {
      case 'day':
        return 'day';
      case 'week':
        return 'week';
      case 'month':
        return 'month';
      case 'year':
        return 'year';
      default:
        return interval;
    }
  } else {
    switch (interval) {
      case 'day':
        return `${intervalCount} days`;
      case 'week':
        return `${intervalCount} weeks`;
      case 'month':
        return `${intervalCount} months`;
      case 'year':
        return `${intervalCount} years`;
      default:
        return `${intervalCount} ${interval}s`;
    }
  }
};
