-- Update chat_messages table constraint to allow 'audio' type
-- Run this script in your Supabase SQL editor

-- First, drop the existing constraint
ALTER TABLE chat_messages 
DROP CONSTRAINT IF EXISTS chat_messages_type_check;

-- Add the new constraint that allows text, image, and audio
ALTER TABLE chat_messages 
ADD CONSTRAINT chat_messages_type_check 
CHECK (type IN ('text', 'image', 'audio'));

-- Verify the constraint was updated
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'chat_messages'::regclass 
AND conname = 'chat_messages_type_check';

