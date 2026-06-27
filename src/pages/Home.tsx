import { useState, useEffect } from 'react';
import { Storage } from '../lib/storage';
import { Link } from 'react-router-dom';
import type { Phrase } from '../types';

export function Home() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);

  useEffect(() => {
    setPhrases(Storage.getPhrases());
  }, []);

  const recentPhrases = phrases.slice(0, 5);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2 mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
          Dashboard
        </h1>
        <p className="text-gray-500">Welcome back to your personal academic phrasebank.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-white/60 shadow-xl shadow-blue-900/5 flex flex-col items-center justify-center">
          <span className="text-6xl font-extrabold text-indigo-600 mb-2">{phrases.length}</span>
          <span className="text-gray-500 font-medium uppercase tracking-wider text-sm">Total Phrases</span>
        </div>
        
        <div className="flex flex-col gap-4">
          <Link to="/add" className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 flex items-center justify-between shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transform hover:-translate-y-1 transition-all group">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              <span className="font-semibold text-lg">Add New Phrase</span>
            </div>
            <span className="group-hover:translate-x-2 transition-transform opacity-70">→</span>
          </Link>
          <Link to="/browse" className="flex-1 bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-6 flex items-center justify-between shadow-xl shadow-blue-900/5 hover:border-indigo-200 transform hover:-translate-y-1 transition-all group">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              <span className="font-semibold text-lg text-gray-800">Browse Categories</span>
            </div>
            <span className="text-gray-400 group-hover:translate-x-2 transition-transform">→</span>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Recently Added</h2>
      </div>

      {recentPhrases.length === 0 ? (
        <div className="bg-white/50 p-12 rounded-2xl border border-dashed border-gray-300 text-center text-gray-500">
          No phrases added yet. Click "Add New Phrase" to get started!
        </div>
      ) : (
        <div className="space-y-4">
          {recentPhrases.map(p => (
            <div key={p.id} className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-white/60 shadow-lg shadow-blue-900/5 flex justify-between items-center group hover:border-indigo-200 transition-colors">
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{p.phrase}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{p.chineseCategory}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
