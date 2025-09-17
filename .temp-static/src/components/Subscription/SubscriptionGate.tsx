'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Star, Zap } from 'lucide-react';
import { ACCESS_LEVELS, isHigherLevel } from '@/lib/access-control';

interface SubscriptionGateProps {
  userId: string;
  influencerId: string;
  influencerName: string;
  requiredLevel: string;
  children: ReactNode;
  fallback?: ReactNode;
}

interface SubscriptionStatus {
  accessLevel: string;
  permissions: any;
  hasActiveSubscription: boolean;
  usage: {
    messagesToday: number;
    messageLimit: {
      canSend: boolean;
      currentCount: number;
      maxAllowed: number;
    };
  };
}

export function SubscriptionGate({ 
  userId, 
  influencerId, 
  influencerName, 
  requiredLevel, 
  children, 
  fallback 
}: SubscriptionGateProps) {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [userId, influencerId]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch(
        `/api/subscription/check?userId=${userId}&influencerId=${influencerId}`
      );
      const data = await response.json();
      setSubscriptionStatus(data);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    );
  }

  if (!subscriptionStatus) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Unable to load subscription status</p>
        </CardContent>
      </Card>
    );
  }

  const { accessLevel, permissions, hasActiveSubscription, usage } = subscriptionStatus;
  const hasAccess = isHigherLevel(accessLevel as any, requiredLevel as any);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
          <Lock className="h-6 w-6 text-orange-600" />
        </div>
        <CardTitle className="text-xl">Upgrade Required</CardTitle>
        <CardDescription>
          You need {getRequiredLevelDisplay(requiredLevel)} access to {influencerName}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <Badge variant="outline" className="mb-2">
            Current: {getLevelDisplay(accessLevel)}
          </Badge>
          <Badge variant="outline">
            Required: {getRequiredLevelDisplay(requiredLevel)}
          </Badge>
        </div>

        {usage && (
          <div className="text-center text-sm text-muted-foreground">
            {usage.messagesToday} messages used today
            {usage.messageLimit.maxAllowed !== -1 && (
              <span> / {usage.messageLimit.maxAllowed}</span>
            )}
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-medium">Current Plan Features:</h4>
          <ul className="text-sm space-y-1">
            <li className="flex items-center gap-2">
              {permissions.canSendMedia ? (
                <Star className="h-4 w-4 text-green-500" />
              ) : (
                <Lock className="h-4 w-4 text-gray-400" />
              )}
              Media messages: {permissions.canSendMedia ? 'Enabled' : 'Disabled'}
            </li>
            <li className="flex items-center gap-2">
              {permissions.canAccessExclusiveContent ? (
                <Star className="h-4 w-4 text-green-500" />
              ) : (
                <Lock className="h-4 w-4 text-gray-400" />
              )}
              Exclusive content: {permissions.canAccessExclusiveContent ? 'Enabled' : 'Disabled'}
            </li>
            <li className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              Response priority: {permissions.responsePriority}
            </li>
          </ul>
        </div>

        <Button className="w-full" onClick={() => window.location.href = `/influencer/${influencerId}/subscribe`}>
          <Crown className="mr-2 h-4 w-4" />
          Upgrade Now
        </Button>
      </CardContent>
    </Card>
  );
}

function getLevelDisplay(level: string): string {
  switch (level) {
    case ACCESS_LEVELS.FREE:
      return 'Free';
    case ACCESS_LEVELS.BASIC:
      return 'Basic';
    case ACCESS_LEVELS.PREMIUM:
      return 'Premium';
    case ACCESS_LEVELS.VIP:
      return 'VIP';
    default:
      return level;
  }
}

function getRequiredLevelDisplay(level: string): string {
  return getLevelDisplay(level);
}
