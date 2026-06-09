import apiClient from './apiClient';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AskRequest {
  question: string;
  subsidiaryID: number;
  history: AIMessage[];
}

export interface AskResponse {
  success: boolean;
  answer: string;
  error?: string;
  toolsused?: string[];
}

export interface DailyBriefItem {
  type: 'positive' | 'warning' | 'urgent' | 'info';
  icon: string;
  text: string;
  module?: string;
}

export interface DailyBriefResponse {
  success: boolean;
  items: DailyBriefItem[];
  generatedat: string;
  source: 'cache' | 'fresh';
  ageminutes: number;
  language: string;
}

export const askAI = (body: AskRequest): Promise<AskResponse> =>
  apiClient.post('/AIAssistant/Ask', body).then((r) => r.data);

export const getDailyBrief = (
  subsidiaryId: number,
  language: string,
  forceRefresh = false
): Promise<DailyBriefResponse> =>
  apiClient
    .get('/AIAssistant/GetDailyBrief', {
      params: { subsidiaryId, language, forceRefresh },
    })
    .then((r) => r.data);
