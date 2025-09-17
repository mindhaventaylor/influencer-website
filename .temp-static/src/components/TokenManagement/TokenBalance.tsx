import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Zap, Clock, Crown } from 'lucide-react';

interface TokenBalanceProps {
  userId: string;
  influencerId?: string;
}

interface TokenData {
  id: string;
  token_type: string;
  total_tokens: number;
  used_tokens: number;
  remaining_tokens: number;
  expires_at: string | null;
  auto_renew: boolean;
  plan_name: string;
  plan_interval: string;
  influencer_name: string;
}

interface TokenBalanceResponse {
  tokens: TokenData[];
  totalTokens: number;
  byInfluencer: Record<string, {
    influencerName: string;
    totalTokens: number;
    tokens: TokenData[];
  }>;
}

export function TokenBalance({ userId, influencerId }: TokenBalanceProps) {
  const [tokenData, setTokenData] = useState<TokenBalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTokenBalance = async () => {
    try {
      setRefreshing(true);
      const url = influencerId 
        ? `/api/tokens/balance?userId=${userId}&influencerId=${influencerId}`
        : `/api/tokens/balance?userId=${userId}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTokenData(data);
      }
    } catch (error) {
      console.error('Error fetching token balance:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchTokenBalance();
    }
  }, [userId, influencerId]);

  const getTokenTypeIcon = (tokenType: string) => {
    switch (tokenType) {
      case 'subscription':
        return <RefreshCw className="h-4 w-4" />;
      case 'one_time':
        return <Zap className="h-4 w-4" />;
      case 'bonus':
        return <Crown className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getTokenTypeColor = (tokenType: string) => {
    switch (tokenType) {
      case 'subscription':
        return 'bg-blue-500';
      case 'one_time':
        return 'bg-green-500';
      case 'bonus':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatExpirationDate = (expiresAt: string | null) => {
    if (!expiresAt) return 'Never expires';
    
    const date = new Date(expiresAt);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Expired';
    if (diffDays === 1) return 'Expires tomorrow';
    if (diffDays <= 7) return `Expires in ${diffDays} days`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Token Balance
          </CardTitle>
          <CardDescription>Loading your token balance...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tokenData || tokenData.tokens.length === 0) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Token Balance
          </CardTitle>
          <CardDescription>You don't have any active tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-4">
            Purchase a plan to get tokens for chatting with influencers!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Token Balance
            </CardTitle>
            <CardDescription>
              Total: <span className="font-bold text-white">{tokenData.totalTokens} tokens</span>
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTokenBalance}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tokens by Influencer */}
        {Object.entries(tokenData.byInfluencer).map(([influencerName, data]) => (
          <div key={influencerName} className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              {influencerName}
              <Badge variant="secondary" className="bg-blue-600">
                {data.totalTokens} tokens
              </Badge>
            </h3>
            
            <div className="space-y-2">
              {data.tokens.map((token) => (
                <div key={token.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className={`p-1 rounded-full ${getTokenTypeColor(token.token_type)} flex-shrink-0`}>
                        {getTokenTypeIcon(token.token_type)}
                      </div>
                      <span className="font-medium text-white truncate">
                        {token.plan_name}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Badge variant="outline" className="text-xs">
                          {token.token_type}
                        </Badge>
                        {token.auto_renew && (
                          <Badge variant="secondary" className="text-xs bg-green-600 whitespace-nowrap">
                            Auto-renew
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-lg font-bold text-white flex-shrink-0 ml-2">
                      {token.remaining_tokens}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>
                      {token.used_tokens} / {token.total_tokens} used
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatExpirationDate(token.expires_at)}</span>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(token.used_tokens / token.total_tokens) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
