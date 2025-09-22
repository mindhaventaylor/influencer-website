import { createClient } from '@supabase/supabase-js'
import { getDatabaseConfig } from './config'

const config = getDatabaseConfig()
const supabaseUrl = config.supabase.url
const supabaseAnonKey = config.supabase.anonKey

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable automatic token refresh
    autoRefreshToken: true,
    // Persist session in localStorage
    persistSession: true,
    // Detect session from URL (for OAuth flows)
    detectSessionInUrl: true,
    // Storage key for session persistence
    storageKey: 'supabase.auth.token',
    // Flow type for authentication
    flowType: 'pkce',
    // Debug mode for development
    debug: process.env.NODE_ENV === 'development',
  },
  // Global configuration
  global: {
    headers: {
      'X-Client-Info': 'influencer-website@1.0.0',
    },
  },
})
