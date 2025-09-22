import { supabase } from './supabaseClient';

/**
 * Handles refresh token errors and clears invalid sessions
 * @param error - The error object
 * @returns true if it was a refresh token error, false otherwise
 */
export function isRefreshTokenError(error: any): boolean {
  if (!error?.message) return false;
  
  const refreshTokenErrors = [
    'Invalid Refresh Token',
    'Refresh Token Not Found',
    'JWT expired',
    'Token has expired',
    'session_not_found',
    'invalid_grant',
    'refresh_token_not_found',
    'invalid_refresh_token'
  ];
  
  return refreshTokenErrors.some(errorType => 
    error.message.toLowerCase().includes(errorType.toLowerCase())
  );
}

/**
 * Clears all authentication data from storage
 */
export async function clearAuthData(): Promise<void> {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut({ scope: 'local' });
    
    // Clear localStorage and sessionStorage
    if (typeof window !== 'undefined') {
      // Remove specific Supabase auth keys
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      
      // Clear any other auth-related storage
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('auth')) {
          localStorage.removeItem(key);
        }
      });
      
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('auth')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    
    console.log('✅ Cleared all authentication data');
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
  }
}

/**
 * Handles refresh token errors by clearing auth data
 * @param error - The error object
 * @returns Promise that resolves when auth data is cleared
 */
export async function handleRefreshTokenError(error: any): Promise<void> {
  if (isRefreshTokenError(error)) {
    console.log('🔄 Refresh token error detected, clearing auth data...');
    await clearAuthData();
  }
}

