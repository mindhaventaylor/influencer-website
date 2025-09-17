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

  async getThread(influencerId: string, userId: string): Promise<Message[]> {
    const key = makeThreadKey(influencerId, userId);
    if (messagesByThreadId.has(key)) {
      return messagesByThreadId.get(key)!;
    }
    if (!messagesPromises.has(key)) {
      const p = api
        .getChatThread(influencerId, userId)
        .then(({ data, error }) => {
          if (error) throw error;
          const msgs = data || [];
          messagesByThreadId.set(key, msgs);
          return msgs;
        })
        .finally(() => {
          messagesPromises.delete(key);
        });
      messagesPromises.set(key, p);
    }
    return messagesPromises.get(key)!;
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
    const next = Array.isArray(messageOrMessages)
      ? [...current, ...messageOrMessages]
      : [...current, messageOrMessages];
    messagesByThreadId.set(key, next);
    notifyThread(key);
    return next;
  },

  replaceOptimistic(influencerId: string, userId: string, tempId: string, userMessage: Message, aiMessage: Message): Message[] {
    const key = makeThreadKey(influencerId, userId);
    const current = messagesByThreadId.get(key) || [];
    const filtered = current.filter((m) => m.id !== tempId);
    const next = [...filtered, userMessage, aiMessage];
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
};

export default ChatCache;
