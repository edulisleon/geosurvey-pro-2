
import { ChatMessage } from '../types';

const CHAT_KEY = 'geo_chat_messages';

export const getMessages = (user1: string, user2: string): ChatMessage[] => {
  const allStr = localStorage.getItem(CHAT_KEY);
  const all: ChatMessage[] = allStr ? JSON.parse(allStr) : [];
  
  return all.filter(m =>
    (m.sender === user1 && m.recipient === user2) ||
    (m.sender === user2 && m.recipient === user1)
  ).sort((a, b) => a.timestamp - b.timestamp);
};

export const sendMessage = (sender: string, recipient: string, text: string): void => {
  const allStr = localStorage.getItem(CHAT_KEY);
  const all: ChatMessage[] = allStr ? JSON.parse(allStr) : [];
  
  const msg: ChatMessage = {
    id: crypto.randomUUID(),
    sender,
    recipient,
    text,
    timestamp: Date.now(),
    read: false
  };
  
  localStorage.setItem(CHAT_KEY, JSON.stringify([...all, msg]));
};
