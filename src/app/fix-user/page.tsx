'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FixUserPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check current user in localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const clearUserData = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    setMessage('✅ Old user data cleared! Now create a new user below.');
  };

  const createNewUser = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/users/create-test-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: `test-${Date.now()}@example.com`, 
          displayName: 'Test User' 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      // Store new user in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      setCurrentUser(data.user);
      setMessage('✅ New user created successfully! You can now test payments.');
      
    } catch (err) {
      console.error('Error creating user:', err);
      setMessage(`❌ Error: ${err instanceof Error ? err.message : 'Failed to create user'}`);
    } finally {
      setLoading(false);
    }
  };

  const isInvalidUserId = currentUser && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUser.id);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">🔧 Fix User ID Issue</h1>
        
        {/* Current User Status */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="">
            <CardTitle className="">Current User Status</CardTitle>
            <CardDescription className="">
              Check if your current user has a valid UUID
            </CardDescription>
          </CardHeader>
          <CardContent className="">
            {currentUser ? (
              <div className={`p-4 rounded ${isInvalidUserId ? 'bg-red-500/10 border border-red-500' : 'bg-green-500/10 border border-green-500'}`}>
                <div className="space-y-2">
                  <p><strong>ID:</strong> <code className="bg-gray-800 px-2 py-1 rounded">{currentUser.id}</code></p>
                  <p><strong>Email:</strong> {currentUser.email}</p>
                  <p><strong>Display Name:</strong> {currentUser.displayName}</p>
                  {isInvalidUserId && (
                    <div className="text-red-400 font-semibold mt-2">
                      ❌ Invalid UUID format! This will cause payment errors.
                    </div>
                  )}
                  {!isInvalidUserId && (
                    <div className="text-green-400 font-semibold mt-2">
                      ✅ Valid UUID format! Ready for payments.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-center py-4">
                No user data found in localStorage
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="">
            <CardTitle className="">Fix Actions</CardTitle>
            <CardDescription className="">
              Clear old data and create a new user with proper UUID
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={clearUserData}
                disabled={!currentUser}
                variant="destructive"
                className="w-full"
              >
                Clear Old User Data
              </Button>
              
              <Button
                onClick={createNewUser}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Creating User...' : 'Create New User'}
              </Button>
            </div>

            {message && (
              <div className={`p-4 rounded text-sm ${
                message.includes('✅') 
                  ? 'bg-green-500/10 border border-green-500 text-green-400' 
                  : 'bg-red-500/10 border border-red-500 text-red-400'
              }`}>
                {message}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        {currentUser && !isInvalidUserId && (
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="">
              <CardTitle className="">🎉 Ready to Test!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-300">
              <p>✅ Your user has a valid UUID</p>
              <p>✅ Payment system is ready</p>
              <p>🚀 Go to the Profile page to test payments</p>
              <div className="mt-4">
                <Button 
                  onClick={() => window.location.href = '/profile'}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Go to Profile & Test Payments
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
