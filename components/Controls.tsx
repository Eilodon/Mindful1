import React, { useState, useEffect, useRef } from 'react';
import { AppState } from '../types';

// --- Type Definitions for Web Speech API ---
interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: any;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}
// -------------------------------------------

interface ControlsProps {
  appState: AppState;
  onSend: (text: string) => void;
  isSpeaking: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ appState, onSend, isSpeaking }) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onSend(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
         setIsListening(false);
      }
    }
  }, [onSend]);

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSend(inputText);
      setInputText('');
    }
  };

  return (
    <div className="fixed bottom-8 left-0 right-0 px-4 flex justify-center w-full z-20">
      <div className="max-w-2xl w-full bg-stone-900/80 backdrop-blur-md rounded-2xl p-2 border border-stone-700 shadow-2xl flex items-center gap-2">
        <button
          onClick={toggleMic}
          disabled={appState === AppState.ANALYZING || appState === AppState.SPEAKING}
          className={`p-4 rounded-full transition-all duration-300 ${
            isListening 
              ? 'bg-red-500 animate-pulse text-white' 
              : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
          } disabled:opacity-50`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
        </button>

        <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={appState !== AppState.IDLE}
            placeholder={
              appState === AppState.SPEAKING ? "Lotus is speaking..." :
              appState === AppState.ANALYZING ? "Reflecting..." :
              "Share your burden..."
            }
            className="w-full bg-transparent text-stone-100 placeholder-stone-500 outline-none px-4"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || appState !== AppState.IDLE}
            className="p-3 bg-amber-600/90 hover:bg-amber-500 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};