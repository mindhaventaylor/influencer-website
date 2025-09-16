/**
 * Custom error class for user-friendly messages that don't show stack traces
 */

export class UserFriendlyError extends Error {
  public readonly isUserFriendly: boolean = true;
  public readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'UserFriendlyError';
    this.statusCode = statusCode;
    
    // Don't capture stack trace for user-friendly errors
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UserFriendlyError);
    }
  }

  // Override toString to only show the message
  toString() {
    return this.message;
  }
}

/**
 * Creates a user-friendly error that won't show stack traces
 * @param message - The user-friendly error message
 * @param statusCode - Optional HTTP status code
 * @returns UserFriendlyError instance
 */
export function createUserFriendlyError(message: string, statusCode?: number): UserFriendlyError {
  return new UserFriendlyError(message, statusCode);
}
