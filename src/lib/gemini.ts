import { Storage } from './storage';

export async function generatePhraseDetails(phrase: string) {
  const settings = Storage.getSettings();
  if (!settings.geminiApiKey) {
    throw new Error('API Key not found. Please set your Gemini API Key in Settings.');
  }

  const prompt = `You are helping a Chinese researcher build a personal academic phrasebank.
Given the following English phrase, generate:
1. A concise English definition explaining its nuance.
2. Three natural academic example sentences.
3. Three suitable usage scenarios (e.g. "Use when explaining a finding carefully").

Return the output as a valid JSON object exactly matching this format:
{"definition": "...", "examples": ["...", "...", "..."], "scenarios": ["...", "...", "..."]}

Phrase: "${phrase}"`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${settings.geminiApiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error?.message || 'Failed to fetch from Gemini API');
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No valid response from AI');
  }

  return JSON.parse(text) as { definition: string, examples: string[], scenarios: string[] };
}
