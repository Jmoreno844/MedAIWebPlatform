export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
}

export interface Message {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: null | string;
}

export interface WebSocketMessage {
  chunk?: string;
  done?: boolean;
  error?: string;
}
