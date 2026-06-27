import { useState, useEffect } from 'react';
import { Storage } from '../lib/storage';
import type { Phrase, Settings } from '../types';
import { Copy, ChevronDown, ChevronUp } from 'lucide-react';

export function CategoryBrowser() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const s = Storage.getSettings();
    setSettings(s);
    if (s.categories.length > 0) {
      setSelectedCategory(s.categories[0].nameZh);
    }
    setPhrases(Storage.getPhrases());
  }, []);

  if (!settings) return null;

  const filteredPhrases = phrases.filter(p => p.chineseCategory === selectedCategory);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] md:h-screen bg-slate-50/50">
      {/* Category Sidebar */}
      <div className="w-full md:w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200/60 overflow-y-auto shrink-0 hidden md:block shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] z-10 relative">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h7" /></svg>
            </div>
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Categories</h2>
          </div>
          <div className="space-y-1.5">
            {settings.categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.nameZh)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 font-medium ${
                  selectedCategory === cat.nameZh
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-500/10 transform scale-[1.02]'
                    : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                }`}
              >
                {cat.nameZh}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Mobile Category Select */}
      <div className="md:hidden p-4 border-b border-gray-200/60 bg-white/90 backdrop-blur-md shrink-0 sticky top-0 z-20 shadow-sm">
        <div className="relative">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-3 pl-4 pr-10 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500/50 appearance-none font-medium text-gray-700 shadow-sm"
          >
          {settings.categories.map(cat => (
            <option key={cat.id} value={cat.nameZh}>{cat.nameZh}</option>
          ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {/* Phrases List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-gradient-to-br from-gray-50/50 to-white pb-24 md:pb-10 relative">
        {/* Subtle background element */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto xl:mx-0 xl:pr-8">
          <div className="hidden md:flex items-center gap-3 mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{selectedCategory}</h1>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold shadow-sm">
              {filteredPhrases.length}
            </span>
          </div>
          
          {filteredPhrases.length === 0 ? (
            <div className="text-center py-16 px-6 bg-white/50 border border-dashed border-gray-300 rounded-2xl shadow-sm backdrop-blur-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </div>
              <p className="text-lg font-medium text-gray-800">No phrases in this category yet.</p>
              <p className="text-sm text-gray-500 mt-2">Add your first phrase to build your personal writing bank.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredPhrases.map(phrase => (
                <div key={phrase.id} className={`bg-white border border-gray-200/60 rounded-2xl p-5 md:p-6 hover:border-indigo-300/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group overflow-hidden ${expandedId === phrase.id ? 'ring-2 ring-indigo-500/10 border-indigo-200' : ''}`}>
                  <div className="flex justify-between items-start gap-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">
                          {phrase.phrase}
                        </h3>
                        {phrase.usageType && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-gray-200">
                            {phrase.usageType}
                          </span>
                        )}
                        {phrase.tone && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-blue-100">
                            {phrase.tone}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-[15px] text-gray-600 leading-relaxed max-w-3xl">{phrase.definition}</p>
                      
                      {phrase.chineseNote && (
                        <div className="mt-3 flex items-start gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100/50">
                          <span className="text-indigo-400 font-medium">💡 Hint:</span>
                          <span className="flex-1">{phrase.chineseNote}</span>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        {phrase.tags.map(tag => (
                          <span key={tag} className="px-2.5 py-1 bg-indigo-50/50 text-indigo-600 border border-indigo-100/50 text-xs rounded-lg font-medium transition-colors hover:bg-indigo-100/50 cursor-default">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 md:gap-2 shrink-0 bg-gray-50/80 p-1.5 rounded-xl border border-gray-100">
                      <button 
                        onClick={() => handleCopy(phrase.phrase)}
                        className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 active:scale-95"
                        title="Copy Phrase"
                      >
                        <Copy size={18} strokeWidth={2.5} />
                      </button>
                      <div className="w-[1px] h-6 bg-gray-200 mx-1"></div>
                      <button 
                        onClick={() => setExpandedId(expandedId === phrase.id ? null : phrase.id)}
                        className={`p-2 rounded-lg transition-all duration-200 hover:bg-white hover:shadow-sm ${
                          expandedId === phrase.id ? 'text-indigo-600 bg-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {expandedId === phrase.id ? <ChevronUp size={18} strokeWidth={2.5} /> : <ChevronDown size={18} strokeWidth={2.5} />}
                      </button>
                    </div>
                  </div>

                  {expandedId === phrase.id && (
                    <div className="mt-5 pt-5 border-t border-gray-100/80 bg-gray-50/50 -mx-6 -mb-6 p-6 rounded-b-2xl">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-4 bg-indigo-500 rounded-full"></div>
                        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider">AI Generated Examples</h4>
                      </div>
                      {phrase.examples && phrase.examples.length > 0 ? (
                        <ul className="space-y-3">
                          {phrase.examples.map((ex, idx) => (
                            <li key={idx} className="text-[15px] text-gray-700 flex items-start gap-3 group bg-white/60 p-3 rounded-xl border border-gray-100/80 shadow-sm hover:shadow-md transition-shadow">
                              <span className="text-indigo-400 font-bold mt-0.5 opacity-50">{idx + 1}.</span>
                              <span className="flex-1 leading-relaxed">{ex}</span>
                              <button onClick={() => handleCopy(ex)} className="opacity-0 md:group-hover:opacity-100 text-gray-400 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded-lg transition-all active:scale-95 shrink-0">
                                <Copy size={16} strokeWidth={2.5} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-gray-500 italic bg-white/40 p-4 rounded-xl border border-gray-100/50">
                          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          No examples generated yet. Try generating some with AI.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
