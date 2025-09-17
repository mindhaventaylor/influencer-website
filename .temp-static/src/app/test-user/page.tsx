'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestUserPage() {
  const [email, setEmail] = useState('test@example.com');
  const [displayName, setDisplayName] = useState('Test User');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/create-test-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, displayName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setUser(data.user);
      
      // Store user in localStorage for the app
      localStorage.setItem('user', JSON.stringify(data.user));
      
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">Test User Creation</h1>
        
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle>Create Test User</CardTitle>
            <CardDescription>
              Create a test user with a proper UUID to test the subscription system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Enter email address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Display Name
              </label>
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Enter display name"
              />
            </div>

            <Button
              onClick={createUser}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Creating User...' : 'Create Test User'}
            </Button>

            {error && (
              <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded">
                {error}
              </div>
            )}

            {user && (
              <div className="bg-green-500/10 border border-green-500 p-4 rounded">
                <h3 className="text-green-400 font-semibold mb-2">User Created Successfully!</h3>
                <div className="text-sm space-y-1">
                  <p><strong>ID:</strong> {user.id}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Display Name:</strong> {user.displayName}</p>
                </div>
                <div className="mt-4 text-sm text-gray-300">
                  <p>✅ User stored in localStorage</p>
                  <p>✅ Ready to test subscription system</p>
                  <p>✅ Go to Profile page to see plans</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-300">
            <p>1. Create a test user above</p>
            <p>2. Go to the Profile page to see available plans</p>
            <p>3. Click "Subscribe" to test the Stripe integration</p>
            <p>4. Check your token balance after purchase</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
