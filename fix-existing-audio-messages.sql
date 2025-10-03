-- Fix existing audio messages in the database
-- Run this AFTER updating the constraint above

-- Update messages that have audio content but type='text' to type='audio'
UPDATE chat_messages 
SET type = 'audio'
WHERE type = 'text' 
AND (
    content LIKE 'data:audio/%'
    OR content LIKE 'http%'
    OR content LIKE 'https://%'
);

-- Verify the updates
SELECT 
    id,
    type,
    CASE 
        WHEN content LIKE 'data:audio/%' THEN 'BASE64_AUDIO'
        WHEN content LIKE 'http%' THEN 'URL_AUDIO'
        ELSE 'TEXT'
    END as content_type,
    SUBSTRING(content, 1, 60) as content_preview
FROM chat_messages 
WHERE sender = 'influencer'
ORDER BY created_at DESC 
LIMIT 10;

