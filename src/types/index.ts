export type Phrase = {
  id: string;
  phrase: string;
  definition?: string;
  chineseCategory: string;
  chineseNote?: string;
  usageType?: string;
  tone?: string;
  tags: string[];
  examples: string[];
  scenarios: string[];
  misuseWarning?: string;
  styleNote?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  nameZh: string;
  description?: string;
  order: number;
};

export type Theme = 'light' | 'dark' | 'eyecare';

export type Settings = {
  categories: Category[];
  usageTypes: string[];
  tones: string[];
  geminiApiKey?: string;
  theme: Theme;
};
