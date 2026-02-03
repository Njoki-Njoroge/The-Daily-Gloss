
import React, { useState, useEffect } from 'react';
import { ViewMode, DailyEntry } from './types';
import { Calendar } from './components/Calendar';
import { Button } from './components/Button';
import { StickerPalette } from './components/StickerPalette';
import { generateEditorial } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.COVER);
  const [entries, setEntries] = useState<Record<string, DailyEntry>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Local state for current editing entry
  const [editingContent, setEditingContent] = useState('');
  const [editingMood, setEditingMood] = useState('Divine');
  const [editingStickers, setEditingStickers] = useState<string[]>([]);
  const [editingImage, setEditingImage] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('chic_daily_logs_2026');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  const saveToLocal = (newEntries: Record<string, DailyEntry>) => {
    localStorage.setItem('chic_daily_logs_2026', JSON.stringify(newEntries));
    setEntries(newEntries);
  };

  const handleDateSelect = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const existing = entries[dateStr];
    
    setSelectedDate(date);
    setEditingContent(existing?.content || '');
    setEditingMood(existing?.mood || 'Divine');
    setEditingStickers(existing?.stickers || []);
    setEditingImage(existing?.imageUrl || `https://picsum.photos/seed/${dateStr}/600/400`);
    setView(ViewMode.ENTRY);
  };

  const handleSaveEntry = async () => {
    if (!selectedDate) return;
    setIsLoading(true);
    
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    // Generate AI editorial
    const editorialResult = await generateEditorial(editingContent, editingMood);

    const newEntry: DailyEntry = {
      id: dateStr,
      date: dateStr,
      content: editingContent,
      mood: editingMood,
      stickers: editingStickers,
      imageUrl: editingImage || '',
      aiEditorial: JSON.stringify(editorialResult)
    };

    const updated = { ...entries, [dateStr]: newEntry };
    saveToLocal(updated);
    setIsLoading(false);
    setView(ViewMode.CALENDAR);
  };

  const renderCover = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50 p-6">
      <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-1000">
        <div className="relative inline-block">
          <h1 className="text-8xl md:text-9xl font-serif-chic text-pink-500 italic relative z-10">Gloss</h1>
          <div className="absolute -bottom-4 -right-4 w-full h-8 bg-lime-300 -z-0 opacity-50"></div>
        </div>
        <p className="font-cursive text-4xl text-gray-500">2026 Collection</p>
        <div className="pt-10">
          <Button onClick={() => setView(ViewMode.CALENDAR)} variant="secondary" className="text-xl px-12 py-4">
            Open the Archives
          </Button>
        </div>
        <div className="mt-12 flex justify-center gap-4">
          <img src="https://picsum.photos/seed/fashion1/200/300" className="w-24 h-32 object-cover rounded shadow-lg transform -rotate-12 border-2 border-white" />
          <img src="https://picsum.photos/seed/fashion2/200/300" className="w-24 h-32 object-cover rounded shadow-lg transform rotate-6 border-2 border-white" />
          <img src="https://picsum.photos/seed/fashion3/200/300" className="w-24 h-32 object-cover rounded shadow-lg transform -rotate-3 border-2 border-white" />
        </div>
      </div>
    </div>
  );

  const renderCalendar = () => (
    <div className="min-h-screen bg-white md:bg-pink-50 py-12 px-4 md:px-0">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        <Calendar 
          onSelectDate={handleDateSelect} 
          hasEntry={(date) => !!entries[date]} 
        />
        <div className="mt-12">
           <Button onClick={() => setView(ViewMode.COVER)} variant="outline">
            Return to Cover
          </Button>
        </div>
      </div>
    </div>
  );

  const renderEntry = () => {
    if (!selectedDate) return null;
    const dateStr = selectedDate.toISOString().split('T')[0];
    const entry = entries[dateStr];
    const editorial = entry?.aiEditorial ? JSON.parse(entry.aiEditorial) : null;

    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto py-12 px-6">
          <div className="flex justify-between items-center mb-12">
            <Button onClick={() => setView(ViewMode.CALENDAR)} variant="outline">Back to Gallery</Button>
            <div className="text-right">
              <h2 className="font-serif-chic text-3xl text-pink-600">{selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</h2>
              <span className="text-lime-600 font-bold uppercase tracking-tighter">Edition 2026</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Left Column: Media & Mood */}
            <div className="space-y-8">
              <div className="relative group">
                <img 
                  src={editingImage || ''} 
                  className="w-full h-[500px] object-cover rounded-2xl shadow-2xl border-4 border-lime-100"
                  alt="Daily mood"
                />
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none">
                  {editingStickers.map((s, i) => (
                    <span key={i} className="text-4xl drop-shadow-lg">{s}</span>
                  ))}
                </div>
              </div>

              <div className="bg-lime-50 p-6 rounded-3xl border border-lime-200">
                <label className="block text-xs font-bold text-lime-800 uppercase tracking-widest mb-3">Today's Aura</label>
                <input 
                  type="text"
                  value={editingMood}
                  onChange={(e) => setEditingMood(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-lime-300 text-2xl font-serif-chic text-lime-900 focus:outline-none focus:border-pink-400 pb-2"
                  placeholder="E.g., Radiant, Mystical..."
                />
              </div>

              <StickerPalette 
                onSelect={(emoji) => setEditingStickers([...editingStickers, emoji])}
                selectedStickers={editingStickers}
                onRemove={(idx) => setEditingStickers(editingStickers.filter((_, i) => i !== idx))}
              />
            </div>

            {/* Right Column: Editor & AI Editorial */}
            <div className="space-y-8">
              <div className="bg-pink-50 p-8 rounded-[2rem] border-2 border-pink-100 shadow-inner min-h-[400px]">
                <label className="block text-xs font-bold text-pink-600 uppercase tracking-widest mb-4 italic">Private Reflections</label>
                <textarea 
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="w-full h-[300px] bg-transparent border-none text-gray-700 leading-relaxed text-lg focus:outline-none placeholder:italic"
                  placeholder="Dear Diary... today was simply..."
                />
              </div>

              {editorial && (
                <div className="bg-white p-10 border-4 border-double border-pink-200 rounded-lg relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-2 bg-lime-300 text-[10px] font-bold rotate-45 translate-x-4 -translate-y-2 uppercase">AI Editor Picks</div>
                   <h3 className="font-serif-chic text-4xl text-black mb-4 leading-tight">{editorial.headline}</h3>
                   <p className="text-gray-600 font-serif-chic italic text-lg leading-relaxed first-letter:text-5xl first-letter:font-bold first-letter:text-pink-500 first-letter:mr-2 first-letter:float-left">
                     {editorial.editorial}
                   </p>
                </div>
              )}

              <div className="pt-8">
                <Button 
                  onClick={handleSaveEntry} 
                  className="w-full py-6 text-xl"
                  variant="primary"
                >
                  {isLoading ? 'Curating your memories...' : (entry ? 'Update Legacy' : 'Publish Day')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans antialiased text-gray-900 overflow-x-hidden">
      {view === ViewMode.COVER && renderCover()}
      {view === ViewMode.CALENDAR && renderCalendar()}
      {view === ViewMode.ENTRY && renderEntry()}
    </div>
  );
};

export default App;
