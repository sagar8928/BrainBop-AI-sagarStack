import { getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import prisma from '@/app/models/prisma';

export async function POST(req) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const { chatId } = await req.json();

    if (!chatId) {
      return NextResponse.json({
        success: false,
        message: 'chatId is required',
      });
    }

    // Validate chat ownership
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId,
      },
    });

    if (!chat) {
      return NextResponse.json({
        success: false,
        message: 'Chat not found or you are not authorized',
      });
    }

    // First delete messages
    await prisma.message.deleteMany({
      where: { chatId },
    });

    // Then delete chat
    await prisma.chat.delete({
      where: { id: chatId },
    });

    return NextResponse.json({
      success: true,
      message: 'Chat deleted successfully',
    });
  } catch (error) {
    console.error('Delete chat error:', error);
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}
