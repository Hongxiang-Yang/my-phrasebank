import { useState, useEffect } from 'react';
import { Storage } from '../lib/storage';
import type { Phrase, Settings } from '../types';
import { Copy, ChevronDown, ChevronUp, Trash2, Edit, Sparkles, Loader2, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { autoRecategorizePhrases } from '../lib/gemini';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export function CategoryBrowser() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isRecategorizing, setIsRecategorizing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const s = Storage.getSettings();
    setSettings(s);
    setPhrases(Storage.getPhrases());
  }, []);

  if (!settings) return null;

  const filteredPhrases = selectedCategory === 'All' 
    ? phrases 
    : phrases.filter(p => p.chineseCategory === selectedCategory);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this phrase?')) {
      const newPhrases = phrases.filter(p => p.id !== id);
      Storage.savePhrases(newPhrases);
      setPhrases(newPhrases);
    }
  };

  const handleAutoRecategorize = async () => {
    if (phrases.length === 0) {
      alert("You don't have any phrases to categorize yet!");
      return;
    }
    if (!confirm('This will completely redesign your categories and update all phrases. Are you sure you want to proceed?')) {
      return;
    }

    setIsRecategorizing(true);
    try {
      const phrasesData = phrases.map(p => ({
        id: p.id,
        phrase: p.phrase,
        definition: p.definition,
        currentCategory: p.chineseCategory
      }));
      
      const { newCategories, mappings } = await autoRecategorizePhrases(phrasesData);
      
      // Update Settings
      const updatedSettings = {
        ...settings,
        categories: newCategories.map(c => ({
          id: crypto.randomUUID(),
          nameZh: c.nameZh,
          order: c.order
        }))
      };
      Storage.saveSettings(updatedSettings);
      setSettings(updatedSettings);

      // Update Phrases
      const updatedPhrases = phrases.map(p => {
        const mapping = mappings.find(m => m.id === p.id);
        if (mapping) {
          return { ...p, chineseCategory: mapping.newCategory };
        }
        return p;
      });
      Storage.savePhrases(updatedPhrases);
      setPhrases(updatedPhrases);
      setSelectedCategory('All');
      
    } catch (err: any) {
      alert('Failed to re-categorize: ' + err.message);
    } finally {
      setIsRecategorizing(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] md:h-screen bg-background text-foreground">
      {/* Category Sidebar */}
      <div className="w-full md:w-72 bg-card border-r border-border overflow-y-auto shrink-0 hidden md:flex flex-col relative z-10">
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
              <Filter size={16} strokeWidth={2.5} />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Categories</h2>
          </div>
          <div className="space-y-1.5 flex-1">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                selectedCategory === 'All'
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              All Phrases
            </button>
            {settings.categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.nameZh)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  selectedCategory === cat.nameZh
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {cat.nameZh}
              </button>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <Button 
              onClick={handleAutoRecategorize}
              disabled={isRecategorizing}
              className="w-full font-bold shadow-md"
            >
              {isRecategorizing ? (
                <><Loader2 size={16} className="mr-2 animate-spin" /> Analyzing...</>
              ) : (
                <><Sparkles size={16} className="mr-2" /> Auto Re-categorize</>
              )}
            </Button>
            <p className="text-[10px] text-muted-foreground mt-3 text-center">Let AI redesign your categories.</p>
          </div>
        </div>
      </div>
      
      {/* Mobile Category Select */}
      <div className="md:hidden p-4 border-b border-border bg-card/90 backdrop-blur-md shrink-0 sticky top-0 z-20">
        <div className="relative">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring appearance-none"
          >
            <option value="All">All Phrases</option>
            {settings.categories.map(cat => (
              <option key={cat.id} value={cat.nameZh}>{cat.nameZh}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-muted-foreground">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Phrases List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-muted/20 pb-24 md:pb-10 relative">
        <div className="max-w-6xl mx-auto w-full">
          <div className="hidden md:flex items-center gap-3 mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight">{selectedCategory}</h1>
            <Badge variant="secondary" className="text-sm font-bold">{filteredPhrases.length}</Badge>
          </div>
          
          {filteredPhrases.length === 0 ? (
            <div className="text-center py-16 px-6 border border-dashed border-border rounded-2xl bg-card">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium">No phrases in this category yet.</p>
              <p className="text-sm text-muted-foreground mt-2">Add your first phrase to build your personal writing bank.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredPhrases.map(phrase => (
                <Card key={phrase.id} className={`overflow-hidden transition-all duration-300 ${expandedId === phrase.id ? 'ring-1 ring-ring border-transparent' : 'hover:border-accent/50'}`}>
                  <div className="p-5 md:p-6 flex justify-between items-start gap-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-xl font-bold leading-tight">
                          {phrase.phrase}
                        </h3>
                        {phrase.usageType && (
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{phrase.usageType}</Badge>
                        )}
                        {phrase.tone && (
                          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">{phrase.tone}</Badge>
                        )}
                      </div>
                      
                      <p className="text-[15px] text-muted-foreground leading-relaxed max-w-3xl">{phrase.definition}</p>
                      
                      {phrase.chineseNote && (
                        <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-xl border border-border">
                          <span className="font-medium text-foreground">💡 Hint:</span>
                          <span className="flex-1">{phrase.chineseNote}</span>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        {phrase.tags.map(tag => (
                          <Badge key={tag} variant="secondary">#{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 md:gap-2 shrink-0 bg-muted/50 p-1.5 rounded-xl border border-border">
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/edit/${phrase.id}`)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Edit size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(phrase.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        <Trash2 size={16} />
                      </Button>
                      <div className="w-[1px] h-6 bg-border mx-1"></div>
                      <Button variant="ghost" size="icon" onClick={() => handleCopy(phrase.phrase)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Copy size={16} />
                      </Button>
                      <div className="w-[1px] h-6 bg-border mx-1"></div>
                      <Button variant="ghost" size="icon" onClick={() => setExpandedId(expandedId === phrase.id ? null : phrase.id)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        {expandedId === phrase.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </Button>
                    </div>
                  </div>

                  {expandedId === phrase.id && (
                    <div className="border-t border-border bg-muted/30 p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                        <h4 className="text-sm font-bold uppercase tracking-wider">AI Generated Examples</h4>
                      </div>
                      {phrase.examples && phrase.examples.length > 0 ? (
                        <ul className="space-y-3">
                          {phrase.examples.map((ex, idx) => (
                            <li key={idx} className="text-[15px] flex items-start gap-3 group bg-card p-3 rounded-xl border border-border shadow-sm hover:shadow-md transition-all">
                              <span className="text-muted-foreground font-bold mt-0.5 opacity-50">{idx + 1}.</span>
                              <span className="flex-1 leading-relaxed">{ex}</span>
                              <Button variant="ghost" size="icon" onClick={() => handleCopy(ex)} className="opacity-0 md:group-hover:opacity-100 h-6 w-6">
                                <Copy size={14} />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground italic bg-card p-4 rounded-xl border border-border">
                          <Sparkles size={16} />
                          No examples generated yet. Try generating some with AI.
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
