'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function TestProfile() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      console.log('🧪 TestProfile: Fetching with user:', user.email);

      try {
        const response = await fetch('/api/user/current', {
          headers: {
            'Authorization': `Bearer ${user.access_token}`,
          },
        });

        console.log('🧪 TestProfile: Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('🧪 TestProfile: Received data:', data);
          setUserProfile(data);
        } else {
          console.error('🧪 TestProfile: API error:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('🧪 TestProfile: Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1>Test Profile API</h1>
      <div className="mt-4">
        <h2>Auth User:</h2>
        <pre>{JSON.stringify(user, null, 2)}</pre>

        <h2 className="mt-4">User Profile:</h2>
        <pre>{JSON.stringify(userProfile, null, 2)}</pre>

        <h2 className="mt-4">Display Logic:</h2>
        <div>
          display_name: {userProfile?.display_name || 'null'}
        </div>
        <div>
          username: {userProfile?.username || 'null'}
        </div>
        <div>
          email: {user?.email || 'null'}
        </div>
        <div>
          Final display: <strong>{userProfile?.display_name || userProfile?.username || user?.email || 'User'}</strong>
        </div>
      </div>
    </div>
  );
}
