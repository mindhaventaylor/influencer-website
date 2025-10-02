-- Update chat_messages table constraint to allow image_with_text and audio_with_text types
-- Run this script in your Supabase SQL editor

-- Step 1: Check current constraint
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'chat_messages'::regclass 
AND conname LIKE '%type%';

-- Step 2: Drop existing constraint if it exists
ALTER TABLE chat_messages 
DROP CONSTRAINT IF EXISTS chat_messages_type_check;

-- Step 3: Add new constraint that allows all message types
ALTER TABLE chat_messages 
ADD CONSTRAINT chat_messages_type_check 
CHECK (type IN ('text', 'image', 'audio', 'image_with_text', 'audio_with_text'));

-- Step 4: Verify the constraint was updated
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'chat_messages'::regclass 
AND conname = 'chat_messages_type_check';

-- Step 5: Check current messages to see what types exist
SELECT DISTINCT type, COUNT(*) as count
FROM chat_messages 
GROUP BY type
ORDER BY type;
