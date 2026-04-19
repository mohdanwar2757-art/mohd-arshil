export interface StudyPlan {
  today: string[];
  priorities: string[];
  timeAllocation: { subject: string; minutes: number }[];
  toSkip: string[];
  revisionTips?: string[];
}

export interface SummaryOutput {
  summary: string;
  bulletPoints: string[];
  actionItems: string[];
}

export interface UserStats {
  userId: string;
  email: string;
  streak: number;
  points: number;
  credits: number;
  badges: string[];
  lastActive: string;
  weakAreas: string[];
  isPro?: boolean;
  subscriptionId?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'streak-7', name: 'Week Warrior', description: 'Maintain a 7-day study streak', icon: '🔥' },
  { id: 'master-hard', name: 'Subject Master', description: 'Master a difficult subect', icon: '🏆' },
  { id: 'summarizer', name: 'Insight Miner', description: 'Generate 10 study summaries', icon: '📖' },
  { id: 'marathon', name: 'Study Marathon', description: 'Complete a 4-hour study session', icon: '🏃' },
];
