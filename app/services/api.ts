const API_KEY = 'sk-105ee18589f84c39bf221bae256a6f61';
const API_URL = 'https://api.deepseek.com/v1/chat/completions';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendMessage(messages: Message[]) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
      }),
    });

    if (!response.ok) {
      throw new Error('API 请求失败');
    }

    const data = await response.json();
    return data.choices[0].message;
  } catch (error) {
    console.error('发送消息时出错:', error);
    throw error;
  }
} 