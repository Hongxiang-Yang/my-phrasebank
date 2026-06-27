import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Storage } from '../lib/storage';
import type { Phrase, Settings } from '../types';
import { generatePhraseDetails } from '../lib/gemini';

export function AddPhrase() {
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
  }, []);

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
      id: crypto.randomUUID(),
      phrase,
      definition: definition || undefined,
      chineseCategory: finalCategory,
      chineseNote: chineseNote || undefined,
      usageType: usageType || undefined,
      tone: tone || undefined,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      examples,
      scenarios,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existingPhrases = Storage.getPhrases();
    Storage.savePhrases([newPhrase, ...existingPhrases]);

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
  };

  if (!settings) return null;

  return (
    <div className="relative min-h-screen pb-24">
      {/* Decorative Background Blob */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-gradient-to-br from-blue-400/20 via-indigo-500/10 to-purple-400/20 blur-[100px] rounded-full pointer-events-none -z-10" />
      
      <div className="p-6 md:p-10 max-w-3xl mx-auto relative z-10">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
            Add New Phrase
          </h1>
          <p className="text-gray-500 text-sm">Expand your personal vocabulary bank.</p>
        </div>
      
      {isSaved && (
        <div className="mb-8 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200/60 shadow-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <span className="font-medium">Phrase saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 flex flex-col">
        <div className="space-y-5 bg-white/70 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-white/60 shadow-xl shadow-blue-900/5 transition-all">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">English Phrase <span className="text-red-400">*</span></label>
            <input 
              required
              value={phrase}
              onChange={e => setPhrase(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 hover:bg-white/80 outline-none placeholder:text-gray-400" 
              placeholder="e.g. This does not necessarily mean that..."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">English Definition</label>
              <button 
                type="button" 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : '✨ Generate with AI'}
              </button>
            </div>
            {generateError && <p className="text-xs text-red-500 mb-2">{generateError}</p>}
            <textarea 
              value={definition}
              onChange={e => setDefinition(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 hover:bg-white/80 outline-none min-h-[100px] resize-y placeholder:text-gray-400" 
              placeholder="Used to soften or qualify an interpretation... (Optional if AI is used)"
            />
          </div>
        </div>

        <div className="space-y-5 bg-white/70 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-white/60 shadow-xl shadow-blue-900/5 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Chinese Category <span className="text-red-400">*</span></label>
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
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 hover:bg-white/80 outline-none appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select a category...</option>
                  {settings.categories.map(cat => (
                    <option key={cat.id} value={cat.nameZh}>{cat.nameZh}</option>
                  ))}
                  <option value="___ADD_NEW___" className="font-bold text-indigo-600">+ Type a new category...</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input 
                    required
                    autoFocus
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 hover:bg-white/80 outline-none"
                    placeholder="Type new category name..."
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      setIsNewCategory(false);
                      setNewCategoryName('');
                      if (settings.categories.length > 0) {
                        setChineseCategory(settings.categories[0].nameZh);
                      }
                    }}
                    className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 font-medium text-sm transition-colors whitespace-nowrap border border-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Chinese Meaning Note (Optional)</label>
              <input 
                value={chineseNote}
                onChange={e => setChineseNote(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 hover:bg-white/80 outline-none placeholder:text-gray-400" 
                placeholder="不是说……；不一定意味着……"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Usage Type (Optional)</label>
              <select 
                value={usageType}
                onChange={e => setUsageType(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 hover:bg-white/80 outline-none appearance-none cursor-pointer"
              >
                <option value="">-- Select --</option>
                {settings.usageTypes.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tone (Optional)</label>
              <select 
                value={tone}
                onChange={e => setTone(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 hover:bg-white/80 outline-none appearance-none cursor-pointer"
              >
                <option value="">-- Select --</option>
                {settings.tones.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tags (Comma separated)</label>
            <input 
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 hover:bg-white/80 outline-none placeholder:text-gray-400" 
              placeholder="discussion, less-ai, qualification"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button 
            type="submit"
            className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Save Phrase
            </span>
          </button>
        </div>
      </form>
    </div>
    </div>
  );
}
