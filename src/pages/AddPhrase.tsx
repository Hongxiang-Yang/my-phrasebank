import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Storage } from '../lib/storage';
import type { Phrase, Settings } from '../types';
import { generatePhraseDetails } from '../lib/gemini';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Sparkles, Check } from 'lucide-react';

export function AddPhrase() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [phrase, setPhrase] = useState('');
  const [definition, setDefinition] = useState('');
  const [chineseCategory, setChineseCategory] = useState('');
  const [chineseNote, setChineseNote] = useState('');
  const [usageType, setUsageType] = useState('');
  const [tone, setTone] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  
  const [examples, setExamples] = useState<string[]>([]);
  const [scenarios, setScenarios] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const s = Storage.getSettings();
    setSettings(s);
    
    if (id) {
      const existingPhrase = Storage.getPhrases().find(p => p.id === id);
      if (existingPhrase) {
        setPhrase(existingPhrase.phrase);
        setDefinition(existingPhrase.definition || '');
        setChineseCategory(existingPhrase.chineseCategory);
        setChineseNote(existingPhrase.chineseNote || '');
        setUsageType(existingPhrase.usageType || '');
        setTone(existingPhrase.tone || '');
        setTagsInput(existingPhrase.tags.join(', '));
        setExamples(existingPhrase.examples || []);
        setScenarios(existingPhrase.scenarios || []);
      }
    }
  }, [id]);

  const handleGenerate = async () => {
    if (!phrase) {
      setGenerateError('Please enter an English Phrase first.');
      return;
    }
    setIsGenerating(true);
    setGenerateError('');
    try {
      const result = await generatePhraseDetails(phrase);
      if (result.definition) setDefinition(result.definition);
      if (result.examples) setExamples(result.examples);
      if (result.scenarios) setScenarios(result.scenarios);
    } catch (err: any) {
      setGenerateError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const finalCategory = isNewCategory ? newCategoryName : chineseCategory;
    if (!phrase || !finalCategory) return;

    const newPhrase: Phrase = {
      id: id || crypto.randomUUID(),
      phrase,
      definition: definition || undefined,
      chineseCategory: finalCategory,
      chineseNote: chineseNote || undefined,
      usageType: usageType || undefined,
      tone: tone || undefined,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      examples,
      scenarios,
      createdAt: id ? (Storage.getPhrases().find(p => p.id === id)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existingPhrases = Storage.getPhrases();
    if (id) {
      Storage.savePhrases(existingPhrases.map(p => p.id === id ? newPhrase : p));
    } else {
      Storage.savePhrases([newPhrase, ...existingPhrases]);
    }

    if (settings && !settings.categories.some(c => c.nameZh === finalCategory)) {
      const updatedSettings = { ...settings };
      updatedSettings.categories.push({
        id: crypto.randomUUID(),
        nameZh: finalCategory,
        order: updatedSettings.categories.length
      });
      Storage.saveSettings(updatedSettings);
      setSettings(updatedSettings);
    }

    if (id) {
      navigate('/browse');
    } else {
      setIsSaved(true);
      setPhrase('');
      setDefinition('');
      setTagsInput('');
      setChineseNote('');
      setExamples([]);
      setScenarios([]);
      setIsNewCategory(false);
      setNewCategoryName('');
      
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  if (!settings) return null;

  return (
    <div className="relative min-h-screen pb-24">
      <div className="p-6 md:p-10 max-w-6xl mx-auto w-full relative z-10">
        <div className="max-w-3xl">
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              {id ? 'Edit Phrase' : 'Add New Phrase'}
            </h1>
            <p className="text-muted-foreground text-sm">{id ? 'Update your phrase details below.' : 'Expand your personal vocabulary bank.'}</p>
          </div>
        
        {isSaved && (
          <div className="mb-8 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="font-medium">Phrase saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 flex flex-col">
          <Card className="p-6 md:p-8 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">English Phrase <span className="text-destructive">*</span></label>
              <Input 
                required
                value={phrase}
                onChange={e => setPhrase(e.target.value)}
                placeholder="e.g. This does not necessarily mean that..."
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">English Definition</label>
                <Button 
                  type="button" 
                  variant="secondary"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="h-8 text-xs font-bold"
                >
                  {isGenerating ? 'Generating...' : <><Sparkles className="w-3 h-3 mr-1" /> Generate with AI</>}
                </Button>
              </div>
              {generateError && <p className="text-xs text-destructive mb-2">{generateError}</p>}
              <textarea 
                value={definition}
                onChange={e => setDefinition(e.target.value)}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-y"
                placeholder="Used to soften or qualify an interpretation... (Optional if AI is used)"
              />
            </div>
          </Card>

          <Card className="p-6 md:p-8 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Chinese Category <span className="text-destructive">*</span></label>
                {!isNewCategory ? (
                  <select 
                    required
                    value={chineseCategory}
                    onChange={e => {
                      if (e.target.value === '___ADD_NEW___') {
                        setIsNewCategory(true);
                        setChineseCategory('');
                      } else {
                        setChineseCategory(e.target.value);
                      }
                    }}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="" disabled>Select a category...</option>
                    {settings.categories.map(cat => (
                      <option key={cat.id} value={cat.nameZh}>{cat.nameZh}</option>
                    ))}
                    <option value="___ADD_NEW___" className="font-bold text-primary">+ Type a new category...</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <Input 
                      required
                      autoFocus
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      placeholder="Type new category name..."
                    />
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsNewCategory(false);
                        setNewCategoryName('');
                        if (settings.categories.length > 0) {
                          setChineseCategory(settings.categories[0].nameZh);
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Chinese Meaning Note (Optional)</label>
                <Input 
                  value={chineseNote}
                  onChange={e => setChineseNote(e.target.value)}
                  placeholder="不是说……；不一定意味着……"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Usage Type (Optional)</label>
                <select 
                  value={usageType}
                  onChange={e => setUsageType(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">-- Select --</option>
                  {settings.usageTypes.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tone (Optional)</label>
                <select 
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">-- Select --</option>
                  {settings.tones.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tags (Comma separated)</label>
              <Input 
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="discussion, less-ai, qualification"
              />
            </div>
          </Card>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="lg" className="px-8 font-semibold">
              <Check className="w-5 h-5 mr-2" />
              {id ? 'Update Phrase' : 'Save Phrase'}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
