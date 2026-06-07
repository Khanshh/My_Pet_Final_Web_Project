import axios from '@/utils/axios';
import { ip3 } from '@/utils/ip';

const API = `${ip3}api/v1`;

export async function createConversation(data: {
  participant_ids: string[];
  initial_message?: string;
}) {
  const res = await axios.post(`${API}/messages/conversations`, data);
  return res.data;
}

export async function getConversations(page: number = 1, limit: number = 20) {
  const res = await axios.get(`${API}/messages/conversations`, {
    params: { page, limit },
  });
  return res.data;
}

export async function getConversationDetail(conversationId: string) {
  const res = await axios.get(
    `${API}/messages/conversations/${conversationId}`,
  );
  return res.data;
}

export async function getConversationMessages(
  conversationId: string,
  page: number = 1,
  limit: number = 50,
) {
  const res = await axios.get(
    `${API}/messages/conversations/${conversationId}/messages`,
    { params: { page, limit } },
  );
  return res.data;
}

export async function sendMessage(conversationId: string, content: string) {
  const res = await axios.post(
    `${API}/messages/conversations/${conversationId}/messages`,
    { content },
  );
  return res.data;
}

export async function getUnreadCount() {
  const res = await axios.get(`${API}/messages/unread-count`);
  return res.data;
}

export async function sendMessageWithAttachment(conversationId: string, file: File, content?: string) {
  const formData = new FormData();
  formData.append('file', file);
  if (content) {
    formData.append('content', content);
  }

  const res = await axios.post(
    `${API}/messages/conversations/${conversationId}/messages/upload`,
    formData
  );
  return res.data;
}
