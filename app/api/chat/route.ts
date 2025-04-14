import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// 验证 token 的中间件
async function verifyToken(req: Request) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

// 获取聊天历史
export async function GET(req: Request) {
  const userId = await verifyToken(req);
  
  if (!userId) {
    return NextResponse.json(
      { error: '未授权' },
      { status: 401 }
    );
  }

  try {
    const history = await prisma.chatHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(history);
  } catch (_error) {
    console.error('获取聊天历史错误:', _error);
    return NextResponse.json(
      { error: '获取聊天历史失败' },
      { status: 500 }
    );
  }
}

// 保存新的聊天记录
export async function POST(req: Request) {
  const userId = await verifyToken(req);
  
  if (!userId) {
    return NextResponse.json(
      { error: '未授权' },
      { status: 401 }
    );
  }

  try {
    const { content, role } = await req.json();

    const chatHistory = await prisma.chatHistory.create({
      data: {
        userId,
        content,
        role,
      },
    });

    return NextResponse.json(chatHistory);
  } catch (_error) {
    console.error('保存聊天记录错误:', _error);
    return NextResponse.json(
      { error: '保存聊天记录失败' },
      { status: 500 }
    );
  }
} 