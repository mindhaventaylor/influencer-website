-- Migration: Add conversations table
-- Date: 2025-01-12
-- Description: Add conversations table for managing user-influencer conversations and tokens

BEGIN;

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  tokens INTEGER DEFAULT 100 NOT NULL,
  influencer_plan_ids JSONB DEFAULT '[]' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add conversation_id column to chat_messages table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chat_messages' 
    AND column_name = 'conversation_id'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_influencer_id ON conversations(influencer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_influencer ON conversations(user_id, influencer_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);

-- Add unique constraint to prevent duplicate conversations
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_unique_user_influencer 
ON conversations(user_id, influencer_id);

COMMIT;

