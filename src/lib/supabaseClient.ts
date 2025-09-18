import { createClient } from '@supabase/supabase-js'
import { getDatabaseConfig } from './config'

const config = getDatabaseConfig()
const supabaseUrl = config.supabase.url
const supabaseAnonKey = config.supabase.anonKey

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
