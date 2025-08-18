import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  sender: 'user' | 'influencer' | 'system';
  content: string;
}

interface InfluencerModelPreset {
  system_prompt: string;
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

async function generateInfluencerReply(
  influencerModelPreset: InfluencerModelPreset,
  priorMessages: Message[],
  latestUserMessage: string
): Promise<string> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable not set.');
  }
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  let conversationHistory = priorMessages.map(msg => `${msg.sender}: ${msg.content}`).join('\n');
  conversationHistory += `\nuser: ${latestUserMessage}`;

  const fullPrompt = `${influencerModelPreset.system_prompt}\n\n${conversationHistory}\n\ninfluencer:`;

  try {
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('Error generating content from Gemini:', error);
    throw new Error('Failed to generate influencer reply.');
  }
}

export { generateInfluencerReply, Message, InfluencerModelPreset };


