import { NextResponse } from 'next/server';

const API_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    console.log('收到的消息:', messages);
    
    const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
    console.log('API Key 前5位:', apiKey?.slice(0, 5) + '...');
    
    if (!apiKey) {
      console.error('API Key 未设置');
      return NextResponse.json(
        { error: 'API Key 未配置' },
        { status: 500 }
      );
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('DeepSeek API 错误:', error);
      throw new Error(error.error?.message || 'API 请求失败');
    }

    const data = await response.json();
    console.log('AI 响应成功');
    return NextResponse.json(data.choices[0].message);
  } catch (error) {
    console.error('AI API 详细错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '调用 AI API 失败' },
      { status: 500 }
    );
  }
} 