/**
 * User-friendly error messages for production
 * Replaces technical error messages with user-friendly ones
 */

export const ERROR_MESSAGES = {
  // Authentication errors
  AUTH_REQUIRED: 'Please sign in to continue',
  AUTH_INVALID: 'Please sign in to continue',
  AUTH_EXPIRED: 'Your session has expired. Please sign in again',
  AUTH_DENIED: 'Access denied. Please check your permissions',
  
  // Network errors
  NETWORK_ERROR: 'Connection problem. Please check your internet and try again',
  SERVER_ERROR: 'Something went wrong. Please try again later',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  
  // User actions
  CONVERSATION_FAILED: 'Unable to start conversation. Please try again',
  MESSAGE_FAILED: 'Unable to send message. Please try again',
  PURCHASE_FAILED: 'Unable to process purchase. Please try again',
  
  // Generic
  UNKNOWN_ERROR: 'Something went wrong. Please try again',
  RETRY_LATER: 'Please try again in a few moments'
};

/**
 * Converts technical error messages to user-friendly ones
 * @param error - The error object or message
 * @returns User-friendly error message
 */
export function getUserFriendlyError(error: any): string {
  if (!error) return ERROR_MESSAGES.UNKNOWN_ERROR;
  
  const message = typeof error === 'string' ? error : error.message || '';
  
  // Authentication errors
  if (message.includes('401') || 
      message.includes('Unauthorized') || 
      message.includes('Invalid authentication') ||
      message.includes('User not authenticated')) {
    return ERROR_MESSAGES.AUTH_REQUIRED;
  }
  
  // Permission errors
  if (message.includes('403') || 
      message.includes('Forbidden') || 
      message.includes('Access denied')) {
    return ERROR_MESSAGES.AUTH_DENIED;
  }
  
  // Not found errors
  if (message.includes('404') || 
      message.includes('Not found')) {
    return ERROR_MESSAGES.SERVICE_UNAVAILABLE;
  }
  
  // Server errors
  if (message.includes('500') || 
      message.includes('502') || 
      message.includes('503') || 
      message.includes('504') ||
      message.includes('Server error')) {
    return ERROR_MESSAGES.SERVER_ERROR;
  }
  
  // Network errors
  if (message.includes('Network') || 
      message.includes('fetch') || 
      message.includes('connection')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  // Conversation specific
  if (message.includes('conversation') || 
      message.includes('chat')) {
    return ERROR_MESSAGES.CONVERSATION_FAILED;
  }
  
  // Message specific
  if (message.includes('message') || 
      message.includes('send')) {
    return ERROR_MESSAGES.MESSAGE_FAILED;
  }
  
  // Purchase specific
  if (message.includes('purchase') || 
      message.includes('payment') || 
      message.includes('stripe')) {
    return ERROR_MESSAGES.PURCHASE_FAILED;
  }
  
  // Return original message if it's already user-friendly
  if (message.includes('Please') || 
      message.includes('Unable to') || 
      message.includes('Something went wrong')) {
    return message;
  }
  
  // Default fallback
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Checks if an error message is user-friendly
 * @param message - The error message
 * @returns true if the message is user-friendly
 */
export function isUserFriendlyMessage(message: string): boolean {
  return message.includes('Please') || 
         message.includes('Unable to') || 
         message.includes('Something went wrong') ||
         message.includes('try again') ||
         message.includes('check your') ||
         message.includes('sign in');
}


