const { GoogleGenAI } = require('@google/genai');

const client = new GoogleGenAI({ apiKey: 'AIzaSyANfxvFKLsWCdWLM8bpcSLN5srd4x6lW3Q' }); // the user's new key

async function listModels() {
  try {
    const models = await client.models.list(); // or listModels? wait, standard @google/genai usage
    // Actually the SDK might not have .list() easily accessible.
    // Let's just use native fetch to the REST API to be absolutely sure what this key can access.
  } catch (e) {
    console.error(e);
  }
}
listModels();
