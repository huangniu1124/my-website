const API_URL = 'https://api.deepseek.com/v1/chat/completions';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendMessage(messages: Message[]) {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API 请求失败');
    }

    return await response.json();
  } catch (error) {
    console.error('发送消息时出错:', error);
    throw error;
  }
} 