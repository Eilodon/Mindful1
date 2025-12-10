import { MeditationMode, Quote, VizParams } from './types';

// PART 1: The "Brain" - Emotion Map
export const EMOTION_MAP: Record<MeditationMode, VizParams> = {
  [MeditationMode.GROUNDING]: {
    color: '#0d9488', // Teal-600
    speed: 0.2,
    amplitude: 0.3,
    noise: 0.2, // Smooth, slow waves for anxiety
  },
  [MeditationMode.INTERBEING]: {
    color: '#d97706', // Amber-600
    speed: 0.6,
    amplitude: 0.8,
    noise: 0.5, // Bright, pulsing for joy
  },
  [MeditationMode.INSIGHT]: {
    color: '#7c3aed', // Violet-600
    speed: 0.3,
    amplitude: 0.5,
    noise: 0.8, // Complex patterns for neutral/confusion
  },
  [MeditationMode.COMPASSION]: {
    color: '#db2777', // Pink-600
    speed: 0.4,
    amplitude: 0.4,
    noise: 0.3, // Gentle, warm for anger/hurt
  },
};

// PART 1: The "Brain" - Wisdom DB
export const THAY_WISDOM_DB: Quote[] = [
  // Grounding (Anxiety/Stress)
  {
    mode: MeditationMode.GROUNDING,
    text: "Breathing in, I calm my body and mind. Breathing out, I smile. Dwelling in the present moment, I know this is the only moment.",
    vietnamese: "Thở vào, tôi làm lắng dịu thân tâm. Thở ra, tôi mỉm cười.",
    source: "Being Peace"
  },
  {
    mode: MeditationMode.GROUNDING,
    text: "Walk as if you are kissing the Earth with your feet.",
    source: "Peace Is Every Step"
  },
  {
    mode: MeditationMode.GROUNDING,
    text: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.",
    source: "Stepping into Freedom"
  },
  
  // Interbeing (Joy/Connection)
  {
    mode: MeditationMode.INTERBEING,
    text: "You are a flower. You are fresh. You are the refreshing water. You are the mountain. You are solid.",
    source: "Touching Peace"
  },
  {
    mode: MeditationMode.INTERBEING,
    text: "Because you are alive, everything is possible.",
    source: "Living Buddha, Living Christ"
  },
  {
    mode: MeditationMode.INTERBEING,
    text: "The present moment is filled with joy and happiness. If you are attentive, you will see it.",
    source: "Peace Is Every Step"
  },

  // Insight (Confusion/Neutral)
  {
    mode: MeditationMode.INSIGHT,
    text: "No mud, no lotus. Both suffering and happiness are of an organic nature, which means they are both transitory.",
    vietnamese: "Không bùn thì không sen.",
    source: "No Mud, No Lotus"
  },
  {
    mode: MeditationMode.INSIGHT,
    text: "Understanding is the foundation of love.",
    source: "Teachings on Love"
  },
  
  // Compassion (Anger/Hurt)
  {
    mode: MeditationMode.COMPASSION,
    text: "When you say something challenging, say it with love. Do not say it to make the other person suffer.",
    source: "The Art of Communicating"
  },
  {
    mode: MeditationMode.COMPASSION,
    text: "To be beautiful means to be yourself. You don’t need to be accepted by others. You need to accept yourself.",
    source: "The Art of Power"
  }
];
