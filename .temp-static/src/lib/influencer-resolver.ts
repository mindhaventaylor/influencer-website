import { getInfluencerInfo } from './config';
import { postgres } from './db';

// Cache for influencer ID resolution
const influencerIdCache = new Map<string, string>();

/**
 * Resolves the current influencer from config to database UUID
 * This ensures proper isolation between different influencer sites
 */
export async function resolveCurrentInfluencerId(): Promise<string> {
  const configInfluencer = getInfluencerInfo();
  const cacheKey = configInfluencer.name;
  
  // Check cache first
  if (influencerIdCache.has(cacheKey)) {
    return influencerIdCache.get(cacheKey)!;
  }
  
  const sql = postgres;
  
  try {
    // Look up influencer by name in database
    const dbInfluencer = await sql`
      SELECT id FROM influencers 
      WHERE name = ${configInfluencer.name} AND is_active = true
      LIMIT 1
    `;
    
    if (dbInfluencer.length > 0) {
      const influencerId = dbInfluencer[0].id;
      // Cache the result
      influencerIdCache.set(cacheKey, influencerId);
      return influencerId;
    }
    
    // If not found in database, throw error
    throw new Error(`Influencer "${configInfluencer.name}" not found in database`);
    
  } catch (error) {
    console.error('Error resolving influencer ID:', error);
    throw error;
  }
}

/**
 * Gets the current influencer data (from database if available, config as fallback)
 */
export async function getCurrentInfluencer() {
  const configInfluencer = getInfluencerInfo();
  const sql = postgres;
  
  try {
    // Try to get from database first
    const dbInfluencer = await sql`
      SELECT id, name, prompt, model_preset, is_active, created_at
      FROM influencers 
      WHERE name = ${configInfluencer.name} AND is_active = true
      LIMIT 1
    `;
    
    if (dbInfluencer.length > 0) {
      return {
        id: dbInfluencer[0].id,
        name: dbInfluencer[0].name,
        display_name: configInfluencer.displayName,
        avatar_url: configInfluencer.avatarUrl,
        bio: configInfluencer.bio,
        prompt: dbInfluencer[0].prompt,
        model_preset: dbInfluencer[0].model_preset,
        is_active: dbInfluencer[0].is_active,
        created_at: dbInfluencer[0].created_at,
        updated_at: dbInfluencer[0].created_at // Use created_at as updated_at since updated_at doesn't exist
      };
    }
    
    // Fallback to config data
    return {
      id: configInfluencer.id,
      name: configInfluencer.name,
      display_name: configInfluencer.displayName,
      avatar_url: configInfluencer.avatarUrl,
      bio: configInfluencer.bio,
      prompt: configInfluencer.prompt || `You are ${configInfluencer.name}, a helpful AI assistant.`,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };
    
  } catch (error) {
    console.error('Error getting current influencer:', error);
    // Return config data as fallback
    return {
      id: configInfluencer.id,
      name: configInfluencer.name,
      display_name: configInfluencer.displayName,
      avatar_url: configInfluencer.avatarUrl,
      bio: configInfluencer.bio,
      prompt: configInfluencer.prompt || `You are ${configInfluencer.name}, a helpful AI assistant.`,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };
  }
}

/**
 * Clears the influencer ID cache (useful for testing or when influencers change)
 */
export function clearInfluencerCache() {
  influencerIdCache.clear();
}
