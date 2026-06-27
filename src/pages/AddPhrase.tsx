import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Storage } from '../lib/storage';
import type { Phrase, Settings } from '../types';
import { generatePhraseDetails } from '../lib/gemini';

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
    <div className="relative min-h-screen pb-24 transition-colors duration-300">
      {/* Decorative Background Blob */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-gradient-to-br from-blue-400/20 via-indigo-500/10 to-purple-400/20 dark:from-blue-600/10 dark:via-indigo-500/5 dark:to-purple-600/10 eyecare:from-[#8b5a2b]/10 eyecare:via-[#c4a98b]/10 eyecare:to-[#8a7b66]/10 blur-[100px] rounded-full pointer-events-none -z-10 transition-colors" />
      
      <div className="p-6 md:p-10 max-w-3xl mx-auto relative z-10">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 eyecare:from-[#8b5a2b] eyecare:to-[#6a421a] tracking-tight transition-colors">
            {id ? 'Edit Phrase' : 'Add New Phrase'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 eyecare:text-[#7a6b56] text-sm transition-colors">{id ? 'Update your phrase details below.' : 'Expand your personal vocabulary bank.'}</p>
        </div>
      
      {isSaved && (
        <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/30 eyecare:bg-[#eaf1e8] text-emerald-700 dark:text-emerald-300 eyecare:text-[#4d7348] rounded-xl border border-emerald-200/60 dark:border-emerald-800/50 eyecare:border-[#cfdecb] shadow-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 transition-colors">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <span className="font-medium">Phrase saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 flex flex-col">
        <div className="space-y-5 bg-white/70 dark:bg-gray-800/70 eyecare:bg-[#f4ebd8]/70 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-white/60 dark:border-gray-700 eyecare:border-[#e6d5b8] shadow-xl shadow-blue-900/5 dark:shadow-none transition-all">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 eyecare:text-[#8a7b66] uppercase tracking-wider mb-2 transition-colors">English Phrase <span className="text-red-400 dark:text-red-500">*</span></label>
            <input 
              required
              value={phrase}
              onChange={e => setPhrase(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 eyecare:bg-[#fbf8f1]/50 border border-gray-200 dark:border-gray-600 eyecare:border-[#e6d5b8] text-gray-800 dark:text-gray-200 eyecare:text-[#433422] text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-500/50 eyecare:focus:ring-[#8b5a2b]/50 focus:border-indigo-500 dark:focus:border-indigo-500 eyecare:focus:border-[#8b5a2b] transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-700/80 eyecare:hover:bg-[#fbf8f1]/80 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 eyecare:placeholder:text-[#a09483]" 
              placeholder="e.g. This does not necessarily mean that..."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 eyecare:text-[#8a7b66] uppercase tracking-wider transition-colors">English Definition</label>
              <button 
                type="button" 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 eyecare:text-[#8b5a2b] hover:text-indigo-800 dark:hover:text-indigo-300 eyecare:hover:text-[#6a421a] bg-indigo-50 dark:bg-indigo-900/30 eyecare:bg-[#e8dec7] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : '✨ Generate with AI'}
              </button>
            </div>
            {generateError && <p className="text-xs text-red-500 mb-2">{generateError}</p>}
            <textarea 
              value={definition}
              onChange={e => setDefinition(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 eyecare:bg-[#fbf8f1]/50 border border-gray-200 dark:border-gray-600 eyecare:border-[#e6d5b8] text-gray-800 dark:text-gray-200 eyecare:text-[#433422] text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-500/50 eyecare:focus:ring-[#8b5a2b]/50 focus:border-indigo-500 dark:focus:border-indigo-500 eyecare:focus:border-[#8b5a2b] transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-700/80 eyecare:hover:bg-[#fbf8f1]/80 outline-none min-h-[100px] resize-y placeholder:text-gray-400 dark:placeholder:text-gray-500 eyecare:placeholder:text-[#a09483]" 
              placeholder="Used to soften or qualify an interpretation... (Optional if AI is used)"
            />
          </div>
        </div>

        <div className="space-y-5 bg-white/70 dark:bg-gray-800/70 eyecare:bg-[#f4ebd8]/70 backdrop-blur-xl p-6 md:p-8 rounded-2xl border border-white/60 dark:border-gray-700 eyecare:border-[#e6d5b8] shadow-xl shadow-blue-900/5 dark:shadow-none transition-all">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 eyecare:text-[#8a7b66] uppercase tracking-wider mb-2 transition-colors">Chinese Category <span className="text-red-400 dark:text-red-500">*</span></label>
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
                  className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 eyecare:bg-[#fbf8f1]/50 border border-gray-200 dark:border-gray-600 eyecare:border-[#e6d5b8] text-gray-800 dark:text-gray-200 eyecare:text-[#433422] text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-500/50 eyecare:focus:ring-[#8b5a2b]/50 focus:border-indigo-500 dark:focus:border-indigo-500 eyecare:focus:border-[#8b5a2b] transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-700/80 eyecare:hover:bg-[#fbf8f1]/80 outline-none appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select a category...</option>
                  {settings.categories.map(cat => (
                    <option key={cat.id} value={cat.nameZh}>{cat.nameZh}</option>
                  ))}
                  <option value="___ADD_NEW___" className="font-bold text-indigo-600 dark:text-indigo-400 eyecare:text-[#8b5a2b]">+ Type a new category...</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input 
                    required
                    autoFocus
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 eyecare:bg-[#fbf8f1]/50 border border-gray-200 dark:border-gray-600 eyecare:border-[#e6d5b8] text-gray-800 dark:text-gray-200 eyecare:text-[#433422] text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-500/50 eyecare:focus:ring-[#8b5a2b]/50 focus:border-indigo-500 dark:focus:border-indigo-500 eyecare:focus:border-[#8b5a2b] transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-700/80 eyecare:hover:bg-[#fbf8f1]/80 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 eyecare:placeholder:text-[#a09483]"
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
                    className="px-4 py-3 bg-gray-100 dark:bg-gray-700 eyecare:bg-[#e8dec7] text-gray-600 dark:text-gray-300 eyecare:text-[#5c4933] rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 eyecare:hover:bg-[#dfd3b9] font-medium text-sm transition-colors whitespace-nowrap border border-gray-200 dark:border-gray-600 eyecare:border-[#d6c9af]"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 eyecare:text-[#8a7b66] uppercase tracking-wider mb-2 transition-colors">Chinese Meaning Note (Optional)</label>
              <input 
                value={chineseNote}
                onChange={e => setChineseNote(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 eyecare:bg-[#fbf8f1]/50 border border-gray-200 dark:border-gray-600 eyecare:border-[#e6d5b8] text-gray-800 dark:text-gray-200 eyecare:text-[#433422] text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-500/50 eyecare:focus:ring-[#8b5a2b]/50 focus:border-indigo-500 dark:focus:border-indigo-500 eyecare:focus:border-[#8b5a2b] transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-700/80 eyecare:hover:bg-[#fbf8f1]/80 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 eyecare:placeholder:text-[#a09483]" 
                placeholder="不是说……；不一定意味着……"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 eyecare:text-[#8a7b66] uppercase tracking-wider mb-2 transition-colors">Usage Type (Optional)</label>
              <select 
                value={usageType}
                onChange={e => setUsageType(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 eyecare:bg-[#fbf8f1]/50 border border-gray-200 dark:border-gray-600 eyecare:border-[#e6d5b8] text-gray-800 dark:text-gray-200 eyecare:text-[#433422] text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-500/50 eyecare:focus:ring-[#8b5a2b]/50 focus:border-indigo-500 dark:focus:border-indigo-500 eyecare:focus:border-[#8b5a2b] transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-700/80 eyecare:hover:bg-[#fbf8f1]/80 outline-none appearance-none cursor-pointer"
              >
                <option value="">-- Select --</option>
                {settings.usageTypes.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 eyecare:text-[#8a7b66] uppercase tracking-wider mb-2 transition-colors">Tone (Optional)</label>
              <select 
                value={tone}
                onChange={e => setTone(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 eyecare:bg-[#fbf8f1]/50 border border-gray-200 dark:border-gray-600 eyecare:border-[#e6d5b8] text-gray-800 dark:text-gray-200 eyecare:text-[#433422] text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-500/50 eyecare:focus:ring-[#8b5a2b]/50 focus:border-indigo-500 dark:focus:border-indigo-500 eyecare:focus:border-[#8b5a2b] transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-700/80 eyecare:hover:bg-[#fbf8f1]/80 outline-none appearance-none cursor-pointer"
              >
                <option value="">-- Select --</option>
                {settings.tones.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 eyecare:text-[#8a7b66] uppercase tracking-wider mb-2 transition-colors">Tags (Comma separated)</label>
            <input 
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 eyecare:bg-[#fbf8f1]/50 border border-gray-200 dark:border-gray-600 eyecare:border-[#e6d5b8] text-gray-800 dark:text-gray-200 eyecare:text-[#433422] text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-500/50 eyecare:focus:ring-[#8b5a2b]/50 focus:border-indigo-500 dark:focus:border-indigo-500 eyecare:focus:border-[#8b5a2b] transition-all duration-200 hover:bg-white/80 dark:hover:bg-gray-700/80 eyecare:hover:bg-[#fbf8f1]/80 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 eyecare:placeholder:text-[#a09483]" 
              placeholder="discussion, less-ai, qualification"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button 
            type="submit"
            className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 eyecare:from-[#8b5a2b] eyecare:to-[#6a421a] hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-500 dark:hover:to-indigo-600 eyecare:hover:from-[#7a4e25] eyecare:hover:to-[#5c3a16] text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 dark:shadow-none hover:shadow-xl hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {id ? 'Update Phrase' : 'Save Phrase'}
            </span>
          </button>
        </div>
      </form>
    </div>
    </div>
  );
}
