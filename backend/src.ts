import dotenv from 'dotenv';
dotenv.config();

// IMPORTANT: API keys and other secrets should be loaded from environment variables
// and set before any other modules are imported.
const supabaseUrl = "https://qroflmfvlhbvhtpzoqbu.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyb2ZsbWZ2bGhidmh0cHpvcWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNTg3NDUsImV4cCI6MjA3MDkzNDc0NX0.mx9cdTujNcu5h-27vwnnJFn0f41LOI2uy28mlWQbBqk";
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyb2ZsbWZ2bGhidmh0cHpvcWJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTM1ODc0NSwiZXhwIjoyMDcwOTM0NzQ1fQ.sgMewwAVNLznA5CnODlkZEnuElp2eQnbigCjm6EiFZA";
process.env.GEMINI_API_KEY = "AIzaSyARi91FR8pTDC6mKKswSimI39sOBHQrkho";

import express from 'express';
import cors from 'cors';
import { generateInfluencerReply, Message, InfluencerModelPreset } from './llmHelper';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(supabaseUrl!, supabaseAnonKey!); // Non-null assertion for simplicity
const supabaseServiceRole = createClient(supabaseUrl!, supabaseServiceRoleKey!, { auth: { persistSession: false } });

// Middleware for user authentication (conceptual)
// ... existing code ...
