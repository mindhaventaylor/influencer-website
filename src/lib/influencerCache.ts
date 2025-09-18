/**
 * Client-side cache for influencer data to reduce API calls
 */

interface CachedInfluencerData {
  influencer: any;
  influencerId: { id: string };
  timestamp: number;
  expiresIn: number; // milliseconds
}

const CACHE_KEY = 'influencer_data_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const InfluencerCache = {
  /**
   * Get cached influencer data if still valid
   */
  get(): CachedInfluencerData | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const data: CachedInfluencerData = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - data.timestamp > data.expiresIn) {
        this.clear();
        return null;
      }
      
      return data;
    } catch (error) {
      console.warn('Error reading influencer cache:', error);
      this.clear();
      return null;
    }
  },

  /**
   * Set influencer data in cache
   */
  set(influencer: any, influencerId: { id: string }): void {
    try {
      const data: CachedInfluencerData = {
        influencer,
        influencerId,
        timestamp: Date.now(),
        expiresIn: CACHE_DURATION
      };
      
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Error setting influencer cache:', error);
    }
  },

  /**
   * Clear the cache
   */
  clear(): void {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.warn('Error clearing influencer cache:', error);
    }
  },

  /**
   * Check if cache exists and is valid
   */
  isValid(): boolean {
    return this.get() !== null;
  }
};
