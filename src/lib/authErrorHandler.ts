import { supabase } from './supabaseClient';
import { UserFriendlyError } from './userFriendlyError';
import { isRefreshTokenError, clearAuthData } from './tokenRefreshHandler';

/**
 * Handles authentication errors by signing out the user and redirecting to login
 * @param error - The error object
 * @param setUser - Function to clear user state
 * @param setCurrentScreen - Function to change screen
 * @param conversationCreatedRef - Ref to clear conversation tracking
 * @param setIsCreatingConversation - Function to clear conversation creation state
 * @returns true if it was an auth error and user was signed out, false otherwise
 */
export async function handleAuthError(
  error: any,
  setUser: (user: any) => void,
  setCurrentScreen: (screen: string) => void,
  conversationCreatedRef?: React.MutableRefObject<Set<string>>,
  setIsCreatingConversation?: (creating: boolean) => void
): Promise<boolean> {
  // Check if it's an authentication error
  const isAuthError = (error instanceof UserFriendlyError && error.statusCode === 401) ||
    (error.message && (
      error.message.includes('Please sign in to continue') ||
      error.message.includes('Invalid authentication') ||
      error.message.includes('401') ||
      error.message.includes('Unauthorized') ||
      error.message.includes('User not authenticated') ||
      error.message.includes('Access forbidden') ||
      error.message.includes('Access denied')
    )) ||
    isRefreshTokenError(error);

  if (isAuthError) {
    console.log('🔐 Authentication error detected, signing out user...');
    
    try {
      // Use the utility function to clear auth data
      await clearAuthData();
      
      // Clear all state
      setUser(null);
      
      if (conversationCreatedRef) {
        conversationCreatedRef.current.clear();
      }
      
      if (setIsCreatingConversation) {
        setIsCreatingConversation(false);
      }
      
      // Redirect to sign-in page
      setCurrentScreen("SignIn");
      
      console.log('✅ User signed out and redirected to login page');
      return true;
    } catch (signOutError) {
      console.error('❌ Error signing out user:', signOutError);
      // Still redirect to login even if sign out fails
      setCurrentScreen("SignIn");
      return true;
    }
  }

  return false;
}

/**
 * Checks if an error is an authentication error
 * @param error - The error object
 * @returns true if it's an auth error, false otherwise
 */
export function isAuthError(error: any): boolean {
  return (error instanceof UserFriendlyError && error.statusCode === 401) ||
    (error.message && (
      error.message.includes('Please sign in to continue') ||
      error.message.includes('Invalid authentication') ||
      error.message.includes('401') ||
      error.message.includes('Unauthorized') ||
      error.message.includes('User not authenticated') ||
      error.message.includes('Access forbidden') ||
      error.message.includes('Access denied')
    ));
}
