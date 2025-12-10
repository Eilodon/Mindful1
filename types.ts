export enum MeditationMode {
  GROUNDING = 'GROUNDING',
  INTERBEING = 'INTERBEING',
  INSIGHT = 'INSIGHT',
  COMPASSION = 'COMPASSION'
}

export interface VizParams {
  color: string;
  speed: number;
  amplitude: number;
  noise: number;
}

export interface Quote {
  text: string;
  source: string;
  vietnamese?: string;
  mode: MeditationMode;
}

export enum AppState {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  ANALYZING = 'ANALYZING',
  SPEAKING = 'SPEAKING'
}

export interface ChatMessage {
  role: 'user' | 'lotus';
  text: string;
}
