export type Mode = 'COLLAB' | 'FOCUS' | 'AI' | 'STUDY';

export interface CanvasObject {
  id: string;
  type: string;
  left: number;
  top: number;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  text?: string;
  fontSize?: number;
  points?: { x: number; y: number }[];
  angle?: number;
  scaleX?: number;
  scaleY?: number;
}

export interface Answer {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}

export interface Question {
  id: string;
  user: string;
  text: string;
  timestamp: number;
  answers: Answer[];
}

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}
