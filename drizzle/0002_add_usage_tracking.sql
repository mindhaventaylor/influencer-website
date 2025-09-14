-- Migration: Add usage tracking table
-- Date: 2025-01-12
-- Description: Add user_usage table for tracking daily message usage

BEGIN;

-- Create user_usage table for tracking daily usage
CREATE TABLE IF NOT EXISTS user_usage (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  messages_sent INTEGER DEFAULT 0 NOT NULL,
  media_messages_sent INTEGER DEFAULT 0 NOT NULL,
  voice_messages_sent INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  PRIMARY KEY (user_id, influencer_id, date)
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_user_usage_date ON user_usage(date);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_influencer ON user_usage(user_id, influencer_id);

COMMIT;
