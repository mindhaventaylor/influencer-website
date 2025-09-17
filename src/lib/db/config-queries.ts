import { db } from './index';
import { plans, influencers } from './schema';
import { eq, and, isNull } from 'drizzle-orm';
import { getInfluencerInfo, getPlans } from '../config';

// Configuration-based queries that use the influencer config
export const configQueries = {
  // Get the current influencer from config
  async getCurrentInfluencer() {
    const influencerInfo = getInfluencerInfo();
    
    // Try to get from database first
    const dbInfluencer = await db.select().from(influencers)
      .where(and(
        eq(influencers.handle, influencerInfo.handle),
        isNull(influencers.deletedAt)
      ))
      .limit(1);
    
    if (dbInfluencer.length > 0) {
      return dbInfluencer[0];
    }
    
    // If not in database, return config data
    return {
      id: influencerInfo.id,
      handle: influencerInfo.handle,
      displayName: influencerInfo.displayName,
      bio: influencerInfo.bio,
      avatarUrl: influencerInfo.avatarUrl,
      isActive: true,
      modelPreset: null,
      priceCents: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    };
  },

  // Get plans from configuration
  async getConfiguredPlans() {
    const configPlans = getPlans();
    const influencerInfo = getInfluencerInfo();
    
    // Try to get from database first
    const dbPlans = await db.select().from(plans)
      .where(and(
        eq(plans.influencerId, influencerInfo.id),
        eq(plans.isActive, true)
      ));
    
    if (dbPlans.length > 0) {
      return dbPlans;
    }
    
    // If not in database, return config plans
    return configPlans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      priceCents: plan.priceCents,
      currency: plan.currency,
      interval: plan.interval,
      influencerId: influencerInfo.id,
      features: plan.features,
      isActive: true,
      stripePriceId: plan.stripePriceId,
      stripeProductId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  },

  // Create plans from configuration if they don't exist
  async ensurePlansExist() {
    const influencerInfo = getInfluencerInfo();
    const configPlans = getPlans();
    
    // Check if plans already exist
    const existingPlans = await db.select().from(plans)
      .where(eq(plans.influencerId, influencerInfo.id));
    
    if (existingPlans.length > 0) {
      return existingPlans;
    }
    
    // Create plans from configuration
    const createdPlans = [];
    for (const planConfig of configPlans) {
      const newPlan = await db.insert(plans).values({
        id: planConfig.id,
        name: planConfig.name,
        description: planConfig.description,
        priceCents: planConfig.priceCents,
        currency: planConfig.currency,
        interval: planConfig.interval,
        influencerId: influencerInfo.id,
        features: planConfig.features,
        isActive: true,
        stripePriceId: planConfig.stripePriceId,
        stripeProductId: null
      }).returning();
      
      createdPlans.push(newPlan[0]);
    }
    
    return createdPlans;
  },

  // Get plan by ID from configuration
  async getPlanById(planId: string) {
    const configPlans = getPlans();
    const plan = configPlans.find(p => p.id === planId);
    
    if (!plan) {
      return null;
    }
    
    // Try to get from database first
    const dbPlan = await db.select().from(plans)
      .where(eq(plans.id, planId))
      .limit(1);
    
    if (dbPlan.length > 0) {
      return dbPlan[0];
    }
    
    // Return config plan
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      priceCents: plan.priceCents,
      currency: plan.currency,
      interval: plan.interval,
      influencerId: getInfluencerInfo().id,
      features: plan.features,
      isActive: true,
      stripePriceId: plan.stripePriceId,
      stripeProductId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  },

  // Get popular plan from configuration
  async getPopularPlan() {
    const configPlans = getPlans();
    const popularPlan = configPlans.find(plan => plan.isPopular);
    
    if (!popularPlan) {
      return null;
    }
    
    return await this.getPlanById(popularPlan.id);
  }
};
