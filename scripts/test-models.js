/**
 * DIAGNOSTIC SCRIPT - DO NOT COMMIT WITH LIVE KEYS
 * Usage: set GEMINI_API_KEY=<your-key> in environment, then run
 */
const apiKey = process.env.GEMINI_API_KEY || '';
if (!apiKey) { console.error('Set GEMINI_API_KEY env var'); process.exit(1); }
// Test connection only
console.log('API key loaded from environment.');
