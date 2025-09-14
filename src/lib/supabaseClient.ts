import { createClient } from '@supabase/supabase-js'
import { getInfluencerConfig } from './config'

const config = getInfluencerConfig()
const supabaseUrl = config.database.supabase.url
const supabaseAnonKey = config.database.supabase.anonKey

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
