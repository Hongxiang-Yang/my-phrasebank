import { useState, useRef } from 'react';
import { Storage } from '../lib/storage';
import { extractPhrasesFromText } from '../lib/gemini';
import type { Phrase } from '../types';
import * as pdfjsLib from 'pdfjs-dist';

// Use CDN for pdf.js worker to avoid Vite build issues with Web Workers
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export function Discover() {
  const [inputText, setInputText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [extractedPhrases, setExtractedPhrases] = useState<Partial<Phrase>[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (file.type === 'text/plain') {
        const text = await file.text();
        setInputText(text);
      } else if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        // Extract from first 10 pages maximum to save API tokens and time
        const numPages = Math.min(pdf.numPages, 10);
        
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n\n';
        }
        setInputText(fullText.trim());
      } else {
        setExtractError('Please upload a PDF or TXT file.');
      }
    } catch (err: any) {
      setExtractError('Error reading file: ' + err.message);
    }
    
    // Clear input so same file can be uploaded again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExtract = async () => {
    if (!inputText.trim()) {
      setExtractError('Please paste some text or upload a document first.');
      return;
    }

    setIsExtracting(true);
    setExtractError('');
    setExtractedPhrases([]);
    setIsSaved(false);

    try {
      const existingPhrases = Storage.getPhrases().map(p => p.phrase);
      const existingCategories = Storage.getSettings().categories.map(c => c.nameZh);
      
      const results = await extractPhrasesFromText(inputText, existingPhrases, existingCategories);
      
      if (!Array.isArray(results) || results.length === 0) {
        setExtractError('No new phrases found in this text.');
      } else {
        setExtractedPhrases(results);
        setSelectedIndices(new Set(results.map((_, i) => i))); // Select all by default
      }
    } catch (err: any) {
      setExtractError(err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveSelected = () => {
    const settings = Storage.getSettings();
    const existingPhrases = Storage.getPhrases();
    const newPhrasesToSave: Phrase[] = [];
    const updatedSettings = { ...settings };

    selectedIndices.forEach(idx => {
      const p = extractedPhrases[idx];
      const newCategory = p.chineseCategory || 'Uncategorized';
      
      const newPhrase: Phrase = {
        id: crypto.randomUUID(),
        phrase: p.phrase || '',
        definition: p.definition,
        chineseCategory: newCategory,
        chineseNote: p.chineseNote,
        usageType: p.usageType,
        tone: p.tone,
        tags: p.tags || [],
        examples: p.examples || [],
        scenarios: p.scenarios || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      newPhrasesToSave.push(newPhrase);

      // Add category if missing
      if (!updatedSettings.categories.some(c => c.nameZh === newCategory)) {
        updatedSettings.categories.push({
          id: crypto.randomUUID(),
          nameZh: newCategory,
          order: updatedSettings.categories.length
        });
      }
    });

    if (newPhrasesToSave.length > 0) {
      Storage.savePhrases([...newPhrasesToSave, ...existingPhrases]);
      Storage.saveSettings(updatedSettings);
      
      setIsSaved(true);
      setExtractedPhrases([]);
      setSelectedIndices(new Set());
      setInputText('');
      
      setTimeout(() => setIsSaved(false), 4000);
    }
  };

  const toggleSelection = (idx: number) => {
    const newSet = new Set(selectedIndices);
    if (newSet.has(idx)) {
      newSet.delete(idx);
    } else {
      newSet.add(idx);
    }
    setSelectedIndices(newSet);
  };

  return (
    <div className="relative min-h-screen pb-24 transition-colors duration-300">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-gradient-to-br from-indigo-400/20 via-purple-500/10 to-pink-400/20 dark:from-indigo-600/10 dark:via-purple-500/5 dark:to-pink-600/10 eyecare:from-[#8b5a2b]/10 eyecare:via-[#c4a98b]/10 eyecare:to-[#8a7b66]/10 blur-[100px] rounded-full pointer-events-none -z-10 transition-colors" />
      
      <div className="p-6 md:p-10 max-w-4xl mx-auto relative z-10">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 eyecare:from-[#8b5a2b] eyecare:to-[#6a421a] tracking-tight transition-colors">
            Discover Phrases
          </h1>
          <p className="text-gray-500 dark:text-gray-400 eyecare:text-[#7a6b56] text-sm transition-colors">Paste academic text or upload a PDF to let AI extract valuable phrases for you.</p>
        </div>

        {isSaved && (
          <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/30 eyecare:bg-[#eaf1e8] text-emerald-700 dark:text-emerald-300 eyecare:text-[#4d7348] rounded-xl border border-emerald-200/60 dark:border-emerald-800/50 eyecare:border-[#cfdecb] shadow-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 transition-colors">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <span className="font-medium">Selected phrases added to your bank!</span>
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white/70 dark:bg-gray-800/70 eyecare:bg-[#f4ebd8]/70 backdrop-blur-xl p-6 rounded-2xl border border-white/60 dark:border-gray-700 eyecare:border-[#e6d5b8] shadow-xl shadow-indigo-900/5 dark:shadow-none transition-all">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 eyecare:text-[#8a7b66] uppercase tracking-wider transition-colors">Source Text</label>
              <div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".txt,.pdf" 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 eyecare:text-[#8b5a2b] hover:text-indigo-800 dark:hover:text-indigo-300 eyecare:hover:text-[#6a421a] bg-indigo-50 dark:bg-indigo-900/30 eyecare:bg-[#e8dec7] px-3 py-1.5 rounded-lg transition-colors"
                >
                  📄 Upload PDF/TXT
                </button>
              </div>
            </div>
            
            <textarea 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 dark:bg-gray-700/50 eyecare:bg-[#fbf8f1]/50 border border-gray-200 dark:border-gray-600 eyecare:border-[#e6d5b8] text-gray-800 dark:text-gray-200 eyecare:text-[#433422] text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-500/50 eyecare:focus:ring-[#8b5a2b]/50 transition-all duration-200 outline-none min-h-[200px] resize-y placeholder:text-gray-400 dark:placeholder:text-gray-500 eyecare:placeholder:text-[#a09483]" 
              placeholder="Paste paragraphs from research papers, emails, or essays here... Or upload a document using the button above."
            />
            
            {extractError && <p className="text-xs text-red-500 mt-2">{extractError}</p>}
            
            <div className="flex justify-end mt-4">
              <button 
                onClick={handleExtract}
                disabled={isExtracting || !inputText.trim()}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-600 dark:to-purple-700 eyecare:from-[#8b5a2b] eyecare:to-[#6a421a] text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/30 dark:shadow-none hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-none"
              >
                {isExtracting ? 'Analyzing Text...' : '✨ Extract Phrases'}
              </button>
            </div>
          </div>

          {extractedPhrases.length > 0 && (
            <div className="bg-white/70 dark:bg-gray-800/70 eyecare:bg-[#f4ebd8]/70 backdrop-blur-xl p-6 rounded-2xl border border-white/60 dark:border-gray-700 eyecare:border-[#e6d5b8] shadow-xl shadow-indigo-900/5 dark:shadow-none transition-all animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 eyecare:text-[#433422] transition-colors">Found {extractedPhrases.length} new phrases</h2>
                <button 
                  onClick={handleSaveSelected}
                  disabled={selectedIndices.size === 0}
                  className="bg-gray-900 dark:bg-gray-100 eyecare:bg-[#433422] text-white dark:text-gray-900 eyecare:text-[#fbf8f1] px-5 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                >
                  Save {selectedIndices.size} Selected
                </button>
              </div>

              <div className="space-y-4">
                {extractedPhrases.map((p, idx) => (
                  <label key={idx} className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedIndices.has(idx) ? 'bg-indigo-50/50 dark:bg-indigo-900/20 eyecare:bg-[#e8dec7]/50 border-indigo-200 dark:border-indigo-500/50 eyecare:border-[#8b5a2b]/50' : 'bg-white/50 dark:bg-gray-800/50 eyecare:bg-[#fbf8f1]/50 border-transparent hover:border-gray-200 dark:hover:border-gray-600 eyecare:hover:border-[#e6d5b8]'}`}>
                    <div className="pt-1">
                      <input 
                        type="checkbox" 
                        checked={selectedIndices.has(idx)}
                        onChange={() => toggleSelection(idx)}
                        className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 eyecare:text-[#433422] transition-colors">{p.phrase}</h3>
                        <span className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400 eyecare:text-[#8b5a2b] bg-indigo-50 dark:bg-indigo-900/30 eyecare:bg-[#e8dec7] px-2 py-0.5 rounded-md transition-colors">{p.chineseCategory}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 eyecare:text-[#5c4933] mb-2 transition-colors">{p.definition}</p>
                      {p.chineseNote && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 eyecare:text-[#8a7b66] transition-colors mb-2">💡 {p.chineseNote}</p>
                      )}
                      <div className="text-sm text-gray-500 dark:text-gray-400 eyecare:text-[#8a7b66] italic bg-white/40 dark:bg-gray-900/40 eyecare:bg-[#fbf8f1]/40 p-2 rounded-lg border border-gray-100 dark:border-gray-700 eyecare:border-[#e6d5b8] transition-colors">
                        "{p.examples?.[0]}"
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
