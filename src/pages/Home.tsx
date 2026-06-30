import { useState, useEffect } from 'react';
import { Storage } from '../lib/storage';
import { Link } from 'react-router-dom';
import type { Phrase } from '../types';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { PlusCircle, LayoutGrid, Clock } from 'lucide-react';

export function Home() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);

  useEffect(() => {
    setPhrases(Storage.getPhrases());
  }, []);

  const recentPhrases = phrases.slice(0, 5);

  return (
    <div className="relative min-h-full">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none" />
      
      <div className="relative z-10 p-6 md:p-10 max-w-6xl mx-auto w-full">
        <div className="flex flex-col gap-2 mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">Welcome back to your personal academic phrasebank.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="flex flex-col items-center justify-center p-8">
            <span className="text-6xl font-extrabold text-primary mb-2">{phrases.length}</span>
            <span className="text-muted-foreground font-medium uppercase tracking-wider text-sm">Total Phrases</span>
          </Card>
          
          <div className="flex flex-col gap-4">
            <Button asChild className="h-auto p-6 flex-1 justify-between shadow-sm group">
              <Link to="/add">
                <div className="flex items-center gap-3">
                  <PlusCircle className="w-6 h-6 opacity-80" />
                  <span className="font-semibold text-lg">Add New Phrase</span>
                </div>
                <span className="opacity-70 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-6 flex-1 justify-between shadow-sm group bg-card">
              <Link to="/browse">
                <div className="flex items-center gap-3">
                  <LayoutGrid className="w-6 h-6 text-accent" />
                  <span className="font-semibold text-lg text-foreground">Browse Categories</span>
                </div>
                <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
            <Clock size={16} strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Recently Added</h2>
        </div>

        {recentPhrases.length === 0 ? (
          <div className="p-12 rounded-2xl border border-dashed border-border text-center text-muted-foreground bg-muted/30">
            No phrases added yet. Click "Add New Phrase" to get started!
          </div>
        ) : (
          <div className="space-y-4">
            {recentPhrases.map(p => (
              <Card key={p.id} className="p-5 flex justify-between items-center group hover:border-accent/50 transition-colors">
                <div>
                  <h3 className="font-bold text-foreground group-hover:text-accent transition-colors">{p.phrase}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="uppercase tracking-wider">{p.chineseCategory}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
