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

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${settings.geminiApiKey}`, {
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

export async function extractPhrasesFromText(textToAnalyze: string, existingPhrases: string[], existingCategories: string[]) {
  const settings = Storage.getSettings();
  if (!settings.geminiApiKey) {
    throw new Error('API Key not found. Please set your Gemini API Key in Settings.');
  }

  const prompt = `You are an expert academic English teacher. 
Extract ALL highly reusable academic phrases, collocations, transition words, structural signposts, and sentence starters from the text below. 
Do NOT limit the quantity. Be exhaustive! It is critical that you find ALL structural connectors (e.g., "To make this argument", "From this position", "As touched on earlier", "To account for").
Exclude any phrases that are exactly identical or very similar to these existing ones: ${JSON.stringify(existingPhrases)}.

For each extracted phrase, provide:
1. "phrase": The English phrase itself.
2. "definition": A concise English explanation of its nuance in academic writing.
3. "chineseCategory": Choose the most appropriate category from this list: ${JSON.stringify(existingCategories)}. If none fit perfectly, invent a short, natural Chinese category name (e.g. 讨论, 描述结果, 等等).
4. "chineseNote": A brief Chinese translation or hint.
5. "usageType": The grammatical function (e.g., "Verb Phrase", "Adverbial", "Noun Collocation").
6. "tone": The tone (e.g., "Objective", "Cautious", "Emphatic").
7. "tags": An array of 1-3 descriptive tags (e.g., ["transition", "contrast"]).
8. "examples": Three natural academic sentences using the phrase.

Return the output as a valid JSON array of objects EXACTLY matching this format:
[
  {
    "phrase": "...",
    "definition": "...",
    "chineseCategory": "...",
    "chineseNote": "...",
    "usageType": "...",
    "tone": "...",
    "tags": ["...", "..."],
    "examples": ["...", "...", "..."]
  }
]

Text to analyze:
"""
${textToAnalyze}
"""`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${settings.geminiApiKey}`, {
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

  return JSON.parse(text) as any[];
}

export async function autoRecategorizePhrases(phrases: { id: string, phrase: string, definition?: string, currentCategory: string }[]) {
  const settings = Storage.getSettings();
  if (!settings.geminiApiKey) {
    throw new Error('API Key not found. Please set your Gemini API Key in Settings.');
  }

  const prompt = `You are an expert academic linguist helping to organize a personal phrase bank.
Here is a list of phrases the user has collected. Currently, they might be in messy or poorly named categories.
Your task is to completely redesign the category system for these phrases to make it logical, intuitive, and highly useful for academic writing.

Create a set of robust Chinese categories (e.g. "引入观点", "过渡与承接", "举例说明", "描述数据", "总结与结论" etc.).
Then, assign each phrase to exactly one of these new categories.

Input Phrases:
${JSON.stringify(phrases)}

Return the output as a valid JSON object exactly matching this format:
{
  "newCategories": [
    {"nameZh": "...", "order": 0},
    {"nameZh": "...", "order": 1}
  ],
  "mappings": [
    {"id": "...", "newCategory": "..."}
  ]
}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${settings.geminiApiKey}`, {
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

  return JSON.parse(text) as { newCategories: {nameZh: string, order: number}[], mappings: {id: string, newCategory: string}[] };
}
