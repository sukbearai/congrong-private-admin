import axios from 'axios';

export interface AiMedsciChatRequest {
  inputs?: Record<string, any>;
  query: string;
  response_mode: 'streaming' | 'blocking';
  conversation_id?: string;
  user?: string;
  files?: any[];
}

export interface AiMedsciChatResponse {
  event: string;
  conversation_id: string;
  message_id: string;
  created_at: number;
  task_id: string;
  id: string;
  answer: string;
  from_variable_selector?: string[];
}

export const aiMedsciChat = (data: AiMedsciChatRequest) => {
  return axios.post<AiMedsciChatResponse>(
    '/api/thirdparty/ai-medsci-chat',
    data
  );
};
