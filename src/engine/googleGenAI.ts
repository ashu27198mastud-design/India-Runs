import { GoogleGenAI } from '@google/genai';

/**
 * Singleton or simple utility to initialize the Google Gen AI Client.
 * We must ensure GEMINI_API_KEY is available in the environment.
 */
let aiClient: GoogleGenAI | null = null;

export function getGenAIClient(): GoogleGenAI {
  if (!aiClient) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is missing. Using dummy mode or throwing error depending on implementation.");
    }
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}
