
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
  school: string;     // Tên trường
  className: string;  // Tên lớp
}

export interface UserMemory {
  insights: string; 
  lastUpdated: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  riskLevel?: RiskLevel;
}

export interface ChatState {
  [key: string]: Message[];
}

export interface StudentAlert {
  id: string;
  studentName: string;
  school: string;     // Trường của học sinh
  className: string;  // Lớp của học sinh
  riskLevel: RiskLevel;
  lastMessage: string;
  timestamp: number;
  personaUsed: string;
}
