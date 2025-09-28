import api from '@/api';

// Simple in-memory cache to avoid re-fetching influencers and chat threads.
// Acts like a singleton by virtue of ES module single instantiation.

interface Influencer {
  id: string;
  name: string;
  prompt: string;
  model_preset?: any;
  [key: string]: any;
}

interface Message {
  id: string;
  sender: 'user' | 'influencer';
  content: string;
  created_at: string;
  [key: string]: any;
}

let cachedInfluencers: Influencer[] | null = null;
let influencersPromise: Promise<Influencer[]> | null = null;
const influencerById = new Map<string, Influencer>();

const messagesByThreadId = new Map<string, Message[]>(); // key: `${influencerId}:${userId}` -> Message[]
const messagesPromises = new Map<string, Promise<Message[]>>();
const listenersByThreadId = new Map<string, Set<(messages: Message[]) => void>>();

function makeThreadKey(influencerId: string, userId: string): string {
  return `${influencerId}:${userId}`;
}

function notifyThread(threadKey: string): void {
  const listeners = listenersByThreadId.get(threadKey);
  if (!listeners) return;
  const messages = messagesByThreadId.get(threadKey) || [];
  listeners.forEach((cb) => {
    try { cb(messages); } catch (_err) {}
  });
}

export const ChatCache = {
  // Influencers
  peekInfluencers(): Influencer[] | null {
    return cachedInfluencers;
  },

  async getInfluencers(): Promise<Influencer[]> {
    if (cachedInfluencers) return cachedInfluencers;
    if (!influencersPromise) {
      influencersPromise = api.getInfluencers()
        .then(({ data, error }) => {
          if (error) throw error;
          cachedInfluencers = data || [];
          cachedInfluencers.forEach((inf) => influencerById.set(inf.id, inf));
          return cachedInfluencers;
        })
        .finally(() => {
          influencersPromise = null;
        });
    }
    return influencersPromise;
  },

  async getInfluencerById(influencerId: string): Promise<Influencer> {
    if (influencerById.has(influencerId)) {
      return influencerById.get(influencerId)!;
    }
    // Try to populate via list
    if (!cachedInfluencers) {
      await this.getInfluencers();
      if (influencerById.has(influencerId)) {
        return influencerById.get(influencerId)!;
      }
    }
    const { data, error } = await api.getInfluencerById(influencerId);
    if (error) throw error;
    influencerById.set(influencerId, data);
    return data;
  },

  // Threads
  peekThread(influencerId: string, userId: string): Message[] | null {
    const key = makeThreadKey(influencerId, userId);
    return messagesByThreadId.get(key) || null;
  },

  async getThread(influencerId: string, userId: string, limit = 5): Promise<Message[]> {
    // Validate inputs
    if (!influencerId || !userId) {
      console.error('Invalid parameters for getThread:', { influencerId, userId });
      throw new Error(`Invalid parameters: influencerId=${influencerId}, userId=${userId}`);
    }

    const key = makeThreadKey(influencerId, userId);
    if (messagesByThreadId.has(key)) {
      return messagesByThreadId.get(key)!;
    }
    if (!messagesPromises.has(key)) {
      console.log('🔄 Fetching chat thread for:', { influencerId, userId, limit });
      const p = api
        .getChatThread(influencerId, userId, limit, 0) // 🚀 OPTIMIZATION: Load fewer messages initially
        .then(async ({ data, error }) => {
          if (error) {
            console.error('Error fetching chat thread:', { 
              error, 
              errorMessage: error.message,
              errorCode: error.code,
              influencerId, 
              userId,
              influencerIdType: typeof influencerId,
              userIdType: typeof userId
            });
            throw error;
          }
          const msgs = data || [];
          
          // 🚀 FIX: Reverse messages for display (newest at bottom)
          const reversedMsgs = msgs.reverse();
          
          // If no messages exist, initialize conversation
          if (reversedMsgs.length === 0) {
            try {
              console.log('No messages found, initializing conversation...');
              await api.initializeConversation(influencerId);
              console.log('Conversation initialized successfully');
            } catch (initError) {
              console.warn('Failed to initialize conversation:', initError);
              // Don't throw here - empty conversation is still valid
            }
          }
          
          messagesByThreadId.set(key, reversedMsgs);
          return reversedMsgs;
        })
        .catch((error) => {
          console.error('ChatCache getThread error:', error);
          // Return empty array on error to prevent infinite loading
          const emptyMsgs: Message[] = [];
          messagesByThreadId.set(key, emptyMsgs);
          return emptyMsgs;
        })
        .finally(() => {
          messagesPromises.delete(key);
        });
      messagesPromises.set(key, p);
    }
    return messagesPromises.get(key)!;
  },

  // 🚀 OPTIMIZATION: Method to load more OLDER messages for pagination
  async loadMoreMessages(influencerId: string, userId: string, limit = 5): Promise<Message[]> {
    const key = makeThreadKey(influencerId, userId);
    const existingMessages = messagesByThreadId.get(key) || [];
    
    // Calculate offset based on existing messages count
    const offset = existingMessages.length;
    
    try {
      const { data, error } = await api.getChatThread(influencerId, userId, limit, offset);
      if (error) {
        console.error('Error loading more messages:', error);
        return [];
      }
      
      const newMessages = data || [];
      
      // 🚀 FIX: Reverse new messages and prepend to existing (older messages go at the top)
      const reversedNewMessages = newMessages.reverse();
      const allMessages = [...reversedNewMessages, ...existingMessages];
      
      messagesByThreadId.set(key, allMessages);
      
      // Notify subscribers
      const subscribers = listenersByThreadId.get(key);
      if (subscribers) {
        subscribers.forEach(callback => callback(allMessages));
      }
      
      return reversedNewMessages;
    } catch (error) {
      console.error('Error loading more messages:', error);
      return [];
    }
  },

  subscribeThread(influencerId: string, userId: string, callback: (messages: Message[]) => void): () => void {
    const key = makeThreadKey(influencerId, userId);
    let set = listenersByThreadId.get(key);
    if (!set) {
      set = new Set();
      listenersByThreadId.set(key, set);
    }
    set.add(callback);
    return () => {
      set.delete(callback);
      if (set.size === 0) listenersByThreadId.delete(key);
    };
  },

  appendToThread(influencerId: string, userId: string, messageOrMessages: Message | Message[]): Message[] {
    const key = makeThreadKey(influencerId, userId);
    const current = messagesByThreadId.get(key) || [];
    
    // 🚀 FIX: Prevent duplicate messages by filtering out existing IDs
    const messagesToAdd = Array.isArray(messageOrMessages) ? messageOrMessages : [messageOrMessages];
    const newMessages = messagesToAdd.filter(newMsg => 
      !current.some(existingMsg => existingMsg.id === newMsg.id)
    );
    
    const next = [...current, ...newMessages];
    messagesByThreadId.set(key, next);
    notifyThread(key);
    return next;
  },

  replaceOptimistic(influencerId: string, userId: string, tempId: string, userMessage: Message, aiMessage: Message): Message[] {
    const key = makeThreadKey(influencerId, userId);
    const current = messagesByThreadId.get(key) || [];
    
    // 🚀 FIX: Remove temp message and prevent duplicates
    const filtered = current.filter((m) => m.id !== tempId);
    
    // Check if messages already exist to prevent duplicates
    const messagesToAdd = [userMessage, aiMessage].filter(newMsg => 
      !filtered.some(existingMsg => existingMsg.id === newMsg.id)
    );
    
    const next = [...filtered, ...messagesToAdd];
    messagesByThreadId.set(key, next);
    notifyThread(key);
    return next;
  },

  removeMessageById(influencerId: string, userId: string, messageId: string): Message[] {
    const key = makeThreadKey(influencerId, userId);
    const current = messagesByThreadId.get(key) || [];
    const next = current.filter((m) => m.id !== messageId);
    messagesByThreadId.set(key, next);
    notifyThread(key);
    return next;
  },

  async sendMessage(influencerId: string, content: string, userId: string) {
    return api.postMessage(influencerId, content, userId);
  },

  // 🚀 FAST MODE: Send message with immediate AI response
  async sendMessageFast(influencerId: string, content: string, userId: string) {
    console.log('🚀 FAST MODE: Starting fast message send...');
    
    // Get AI response immediately (no database save)
    const result = await api.postMessageFast(influencerId, content, userId);
    
    // Save to database in background (non-blocking)
    api.saveMessagesBackground(influencerId, result.userMessage, result.aiMessage, userId)
      .then((saveResult) => {
        if (saveResult.success) {
          console.log('💾 Background save completed successfully');
          // Update cache with real database IDs if needed
          const key = makeThreadKey(influencerId, userId);
          const current = messagesByThreadId.get(key) || [];
          
          // Replace temp messages with saved ones if they have real IDs
          if (saveResult.savedUserMessage && saveResult.savedAiMessage) {
            const updated = current.map(msg => {
              if (msg.id === result.userMessage.id && msg.is_temp) {
                return { ...saveResult.savedUserMessage, is_temp: false };
              }
              if (msg.id === result.aiMessage.id && msg.is_temp) {
                return { ...saveResult.savedAiMessage, is_temp: false };
              }
              return msg;
            });
            messagesByThreadId.set(key, updated);
            notifyThread(key);
          }
        } else {
          console.warn('🚀 Background save failed:', saveResult.error);
          // Could show a retry button or warning to user
        }
      })
      .catch((error) => {
        console.error('🚀 Background save error:', error);
        // Background save failed, but user still sees the message
      });
    
    return result;
  },
};

export default ChatCache;
