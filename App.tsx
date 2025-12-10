import React, { useState, useEffect, useCallback, useRef } from 'react';
import { QuantumViz } from './components/QuantumViz';
import { Controls } from './components/Controls';
import { EMOTION_MAP, THAY_WISDOM_DB } from './constants';
import { analyzeSentiment, generateSpeech } from './services/geminiService';
import { AppState, MeditationMode, Quote, ChatMessage } from './types';

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [currentMode, setCurrentMode] = useState<MeditationMode>(MeditationMode.INSIGHT);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  
  // Audio Context for playback
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize from LocalStorage (Part 5: Polish)
  useEffect(() => {
    const savedStreak = localStorage.getItem('lotus_streak');
    if (savedStreak) setStreak(parseInt(savedStreak, 10));
    
    // Init AudioContext on first interaction if needed, but usually better in handler
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  const handleUserWithInterbeing = async (text: string) => {
    // Update Streak
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem('lotus_streak', newStreak.toString());

    setHistory(prev => [...prev, { role: 'user', text }]);
    setAppState(AppState.ANALYZING);

    // 1. Analyze Sentiment
    const mode = await analyzeSentiment(text);
    setCurrentMode(mode);

    // 2. Select Quote (Offline/Deterministic to prevent hallucination)
    const availableQuotes = THAY_WISDOM_DB.filter(q => q.mode === mode);
    const selectedQuote = availableQuotes[Math.floor(Math.random() * availableQuotes.length)];
    setQuote(selectedQuote);

    // 3. Generate Speech
    const audioBuffer = await generateSpeech(selectedQuote.text);

    setAppState(AppState.SPEAKING);
    setHistory(prev => [...prev, { role: 'lotus', text: selectedQuote.text }]);

    // 4. Play Audio
    if (audioBuffer && audioContextRef.current) {
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') await ctx.resume();

      const buffer = await ctx.decodeAudioData(audioBuffer);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => {
        setAppState(AppState.IDLE);
      };
      source.start(0);
    } else {
      // Fallback if audio fails or context issues
      setTimeout(() => setAppState(AppState.IDLE), 5000);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden text-stone-200 font-sans selection:bg-amber-500/30">
      
      {/* Background Viz - The "Eyes" */}
      <QuantumViz params={EMOTION_MAP[currentMode]} />

      {/* Main Content Layer */}
      <div className="relative z-10 h-full flex flex-col items-center justify-between p-6 pb-32">
        
        {/* Header / Interbeing Badge */}
        <div className="w-full flex justify-between items-start opacity-80 hover:opacity-100 transition-opacity">
          <div>
            <h1 className="text-2xl font-light tracking-widest text-amber-100">MINDFUL LOTUS</h1>
            <p className="text-xs text-amber-300/60 uppercase tracking-widest mt-1">
              Thich Nhat Hanh Inspired
            </p>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 bg-stone-900/40 px-3 py-1 rounded-full border border-stone-700/50 backdrop-blur-sm">
               <span className="text-amber-500 text-lg">✻</span>
               <span className="text-sm font-mono">{streak} Breaths</span>
            </div>
            {streak >= 3 && (
               <span className="text-[10px] text-amber-400 mt-1 animate-fade-in">Interbeing Badge Unlocked</span>
            )}
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="max-w-xl w-full text-center space-y-8">
           {appState === AppState.ANALYZING && (
             <div className="animate-pulse text-stone-400 font-light tracking-wide">
               Looking deeply into the nature of your feelings...
             </div>
           )}

           {quote && appState !== AppState.ANALYZING && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <blockquote className="text-2xl md:text-3xl font-serif text-stone-100 leading-relaxed drop-shadow-lg">
                  "{quote.text}"
                </blockquote>
                
                {quote.vietnamese && (
                  <p className="text-lg text-amber-200/60 font-serif italic">
                    {quote.vietnamese}
                  </p>
                )}

                <cite className="block text-sm text-stone-500 tracking-widest uppercase not-italic">
                  — {quote.source}
                </cite>
             </div>
           )}
        </div>

        {/* Controls Layer */}
        <Controls 
          appState={appState} 
          onSend={handleUserWithInterbeing}
          isSpeaking={appState === AppState.SPEAKING} 
        />
      </div>
      
      {/* CSS Utilities for Animations not in Tailwind default */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
