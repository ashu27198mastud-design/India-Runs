/**
 * DIAGNOSTIC SCRIPT - DO NOT COMMIT WITH LIVE KEYS
 * Usage: set GEMINI_API_KEY=<your-key> in environment, then run
 */
const apiKey = process.env.GEMINI_API_KEY || '';
if (!apiKey) { console.error('Set GEMINI_API_KEY env var'); process.exit(1); }
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
  .then(res => res.json())
  .then(data => { const models = data.models.map(m => m.name); console.log(models); })
  .catch(err => console.error(err));
