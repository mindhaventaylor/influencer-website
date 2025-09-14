'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get('plan_id');

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
          <CardDescription className="text-gray-500">
            Your payment was cancelled. No charges have been made.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              You can try again anytime or choose a different plan.
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              onClick={() => router.push('/')}
            >
              Go Home
            </Button>
            {planId && (
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => router.push(`/influencer/${planId}`)}
              >
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
