import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/app/models/prisma';

export async function POST(req) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated' },
        { status: 401 }
      );
    }

    const { chatId, name } = await req.json();

    if (!chatId || !name) {
      return NextResponse.json(
        { success: false, message: 'chatId and name are required' },
        { status: 400 }
      );
    }

    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
    });

    if (!chat) {
      return NextResponse.json(
        { success: false, message: 'Chat not found or unauthorized' },
        { status: 404 }
      );
    }

    await prisma.chat.update({
      where: { id: chatId },
      data: { name },
    });

    return NextResponse.json({
      success: true,
      message: 'Chat renamed successfully',
    });
  } catch (error) {
    console.error('Rename chat error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
