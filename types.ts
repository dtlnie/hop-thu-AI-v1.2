
export enum RiskLevel {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  ORANGE = 'ORANGE',
  RED = 'RED'
}

export type PersonaType = 'TEACHER' | 'FRIEND' | 'EXPERT' | 'LISTENER';

export interface User {
  id: string;
  username: string;
  role: 'student' | 'teacher';
  avatar: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  riskLevel?: RiskLevel;
}

export interface ChatSession {
  id: string;
  userId: string;
  persona: PersonaType;
  messages: Message[];
  lastRiskLevel: RiskLevel;
}

export interface StudentAlert {
  id: string;
  studentName: string;
  riskLevel: RiskLevel;
  lastMessage: string;
  timestamp: number;
}
