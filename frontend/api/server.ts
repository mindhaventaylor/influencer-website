import express from 'express';
import cors from 'cors';
import { generateInfluencerReply, Message, InfluencerModelPreset } from './llmHelper';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = "https://qroflmfvlhbvhtpzoqbu.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyb2ZsbWZ2bGhidmh0cHpvcWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNTg3NDUsImV4cCI6MjA3MDkzNDc0NX0.mx9cdTujNcu5h-27vwnnJFn0f41LOI2uy28mlWQbBqk";
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyb2ZsbWZ2bGhidmh0cHpvcWJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM1ODc0NSwiZXhwIjoyMDcwOTM0NzQ1fQ.sgMewwAVNLznA5CnODlkZEnuElp2eQnbigCjm6EiFZA";
process.env.GEMINI_API_KEY = "AIzaSyARi91FR8pTDC6mKKswSimI39sOBHQrkho";

const supabase = createClient(supabaseUrl!, supabaseAnonKey!); // Non-null assertion for simplicity
const supabaseServiceRole = createClient(supabaseUrl!, supabaseServiceRoleKey!, { auth: { persistSession: false } });

// Middleware for user authentication (conceptual)
const authenticateUser = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const { data: user, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  req.user = user.user;
  next();
};

// 1. List Conversations for Auth User
app.get('/api/conversations', authenticateUser, async (req: any, res: any) => {
  const userId = req.user.id;
  const { data, error } = await supabase
    .from('conversations')
    .select('*, influencers(*)')
    .eq('user_id', userId);

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.json([]);
  res.json(data);
});

// 2. Fetch a Thread (Paginated)
app.get('/api/conversations/:influencerId/messages', authenticateUser, async (req: any, res: any) => {
  const userId = req.user.id;
  const { influencerId } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .eq('influencer_id', influencerId)
    .order('created_at', { ascending: true })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 3. Post a User Message and Get Influencer Reply
app.post('/api/conversations/:influencerId/messages', authenticateUser, async (req: any, res: any) => {
  const userId = req.user.id;
  const { influencerId } = req.params;
  const { content } = req.body;

  // 1. Insert user message
  const { data: userMessage, error: userMessageError } = await supabaseServiceRole
    .from('chat_messages')
    .insert({
      user_id: userId,
      influencer_id: influencerId,
      sender: 'user',
      content: content,
    })
    .select()
    .single();

  if (userMessageError) return res.status(500).json({ error: userMessageError.message });

  // 2. Fetch influencer's system prompt and prior messages
  const { data: influencer, error: influencerError } = await supabase
    .from('influencers')
    .select('prompt, model_preset')
    .eq('id', influencerId)
    .single();

  if (influencerError || !influencer?.prompt) {
    return res.status(500).json({ error: 'Influencer not found or missing system prompt.' });
  }

  const { data: priorMessages, error: priorMessagesError } = await supabase
    .from('chat_messages')
    .select('sender, content')
    .eq('user_id', userId)
    .eq('influencer_id', influencerId)
    .order('created_at', { ascending: true });

  if (priorMessagesError) return res.status(500).json({ error: priorMessagesError.message });

  // 3. Generate influencer reply using LLM helper
  let influencerReplyContent: string;
  try {
    const modelPreset: InfluencerModelPreset = {
      ...influencer.model_preset as object,
      system_prompt: influencer.prompt,
    };
    influencerReplyContent = await generateInfluencerReply(
      modelPreset,
      priorMessages as Message[],
      content
    );
  } catch (llmError) {
    console.error('LLM generation failed:', llmError);
    return res.status(500).json({ error: 'Failed to generate AI reply.' });
  }

  // 4. Insert influencer reply
  const { data: aiMessage, error: aiMessageError } = await supabaseServiceRole
    .from('chat_messages')
    .insert({
      user_id: userId,
      influencer_id: influencerId,
      sender: 'influencer',
      content: influencerReplyContent,
    })
    .select()
    .single();

  if (aiMessageError) return res.status(500).json({ error: aiMessageError.message });

  res.json(aiMessage);
});

// 4. Mark Messages Read
app.post('/api/conversations/:influencerId/mark-read', authenticateUser, async (req: any, res: any) => {
  const userId = req.user.id;
  const { influencerId } = req.params;

  const { data, error } = await supabase
    .from('chat_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('influencer_id', influencerId)
    .is('read_at', null) // Only mark unread messages
    .in('sender', ['influencer', 'system']); // Only mark messages from influencer or system

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, message: 'Messages marked as read.' });
});


export default app;




// Supabase Auth routes
app.post("/api/auth/signup", async (req: any, res: any) => {
  const { email, password, username, display_name, gender_identity, pronouns } = req.body;
  
  // Step 1: Create the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) return res.status(400).json({ error: authError.message });
  if (!authData.user) return res.status(500).json({ error: "User not created in auth." });

  // Step 2: Insert the user profile into the public.users table using the service role client
  const { error: upsertError } = await supabaseServiceRole
    .from('users')
    .upsert([{ 
      id: authData.user.id, 
      email: authData.user.email,
      username: username,
      display_name: display_name,
      gender_identity: gender_identity,
      pronouns: pronouns,
    }]);

  if (upsertError) {
    // If the profile upsert fails, delete the auth user using the service role client and return the error
    try {
      await supabaseServiceRole.auth.admin.deleteUser(authData.user.id);
    } catch (deleteErr) {
      console.error('Failed to delete auth user after profile upsert error:', deleteErr);
    }
    console.error('Error upserting user into public.users:', upsertError);
    return res.status(500).json({ error: 'Failed to create user profile.' });
  }

  res.json(authData);
});

app.post("/api/auth/signin", async (req: any, res: any) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.post("/api/auth/signout", async (req: any, res: any) => {
  const { error } = await supabase.auth.signOut();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Signed out successfully" });
});

app.post('/api/users', authenticateUser, async (req: any, res: any) => {
  const { user } = req;
  const { username, display_name, avatar_url } = req.body;

  const { data, error } = await supabase
    .from('users')
    .update({ username, display_name, avatar_url, updated_at: new Date() })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});


