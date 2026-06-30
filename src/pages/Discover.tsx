import { useState, useRef } from 'react';
import { Storage } from '../lib/storage';
import { extractPhrasesFromText } from '../lib/gemini';
import type { Phrase } from '../types';
import * as pdfjsLib from 'pdfjs-dist';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Check, FileText, Sparkles, Loader2 } from 'lucide-react';

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
    <div className="relative min-h-screen pb-24">
      <div className="p-6 md:p-10 max-w-5xl mx-auto w-full relative z-10">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Discover Phrases
          </h1>
          <p className="text-muted-foreground text-sm">Paste academic text or upload a PDF to let AI extract valuable phrases for you.</p>
        </div>

        {isSaved && (
          <div className="mb-8 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="font-medium">Selected phrases added to your bank!</span>
          </div>
        )}

        <div className="space-y-6">
          <Card className="p-6 md:p-8 space-y-5">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source Text</label>
              <div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".txt,.pdf" 
                  className="hidden" 
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="secondary"
                  size="sm"
                  className="h-8 text-xs font-bold"
                >
                  <FileText className="w-3 h-3 mr-1" /> Upload PDF/TXT
                </Button>
              </div>
            </div>
            
            <textarea 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[200px] resize-y" 
              placeholder="Paste paragraphs from research papers, emails, or essays here... Or upload a document using the button above."
            />
            
            {extractError && <p className="text-xs text-destructive mt-2">{extractError}</p>}
            
            <div className="flex justify-end pt-2">
              <Button 
                onClick={handleExtract}
                disabled={isExtracting || !inputText.trim()}
                size="lg"
                className="font-semibold"
              >
                {isExtracting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing Text...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Extract Phrases</>
                )}
              </Button>
            </div>
          </Card>

          {extractedPhrases.length > 0 && (
            <Card className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">Found {extractedPhrases.length} new phrases</h2>
                <Button 
                  onClick={handleSaveSelected}
                  disabled={selectedIndices.size === 0}
                  className="font-semibold"
                >
                  Save {selectedIndices.size} Selected
                </Button>
              </div>

              <div className="space-y-4">
                {extractedPhrases.map((p, idx) => (
                  <label key={idx} className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedIndices.has(idx) ? 'bg-accent/30 border-primary/50' : 'bg-card border-border hover:border-accent'}`}>
                    <div className="pt-1">
                      <input 
                        type="checkbox" 
                        checked={selectedIndices.has(idx)}
                        onChange={() => toggleSelection(idx)}
                        className="w-5 h-5 text-primary rounded border-input focus:ring-ring"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold leading-tight">{p.phrase}</h3>
                        <Badge variant="outline" className="text-xs font-bold uppercase">{p.chineseCategory}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{p.definition}</p>
                      {p.chineseNote && (
                        <p className="text-xs text-muted-foreground mb-2">💡 {p.chineseNote}</p>
                      )}
                      <div className="text-sm text-muted-foreground italic bg-muted/50 p-2 rounded-lg border border-border">
                        "{p.examples?.[0]}"
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
