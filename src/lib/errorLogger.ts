/**
 * Production-friendly error logging utility
 * Prevents stack traces from showing to users in production
 */

import { UserFriendlyError } from './userFriendlyError';

/**
 * Logs errors in a production-friendly way
 * @param message - The error message
 * @param error - The error object (optional)
 * @param context - Additional context (optional)
 */
export function logError(message: string, error?: any, context?: any) {
  // If it's a UserFriendlyError, never show stack trace
  if (error instanceof UserFriendlyError) {
    console.log(`[ERROR] ${error.message}`);
    if (context) {
      console.log(`[CONTEXT]`, context);
    }
  } else if (process.env.NODE_ENV === 'development') {
    // In development, show full error details for non-user-friendly errors
    console.error(message, error, context);
  } else {
    // In production, only log user-friendly messages
    const userFriendlyMessage = error?.message || message;
    console.log(`[ERROR] ${userFriendlyMessage}`);
    
    // Log additional context if provided
    if (context) {
      console.log(`[CONTEXT]`, context);
    }
  }
}

/**
 * Logs warnings in a production-friendly way
 * @param message - The warning message
 * @param context - Additional context (optional)
 */
export function logWarning(message: string, context?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.warn(message, context);
  } else {
    console.log(`[WARNING] ${message}`);
    if (context) {
      console.log(`[CONTEXT]`, context);
    }
  }
}

/**
 * Logs info messages
 * @param message - The info message
 * @param context - Additional context (optional)
 */
export function logInfo(message: string, context?: any) {
  console.log(`[INFO] ${message}`);
  if (context) {
    console.log(`[CONTEXT]`, context);
  }
}

/**
 * Logs success messages
 * @param message - The success message
 * @param context - Additional context (optional)
 */
export function logSuccess(message: string, context?: any) {
  console.log(`[SUCCESS] ${message}`);
  if (context) {
    console.log(`[CONTEXT]`, context);
  }
}
