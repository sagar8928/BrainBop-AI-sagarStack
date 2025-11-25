import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import prisma from '@/app/models/prisma';
import Groq from 'groq-sdk';

export async function POST(req) {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('Missing GROQ_API_KEY');
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const { userId } = getAuth(req);
    if (!userId)
      return NextResponse.json(
        { success: false, message: 'User not authenticated' },
        { status: 401 }
      );

    const { chatId, prompt } = await req.json();
    if (!chatId || !prompt)
      return NextResponse.json(
        { success: false, message: 'chatId and prompt required' },
        { status: 400 }
      );

    const chat = await prisma.chat.findFirst({ where: { id: chatId, userId } });
    if (!chat)
      return NextResponse.json(
        { success: false, message: 'Chat not found' },
        { status: 404 }
      );

    // store user message
    await prisma.message.create({
      data: { chatId, role: 'user', content: prompt },
    });

    // fetch entire chat history
    const history = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });

    const groqMessages = history.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // send to Groq
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: groqMessages,
      temperature: 0.7,
      max_tokens: 800,
    });

    const aiText = completion.choices[0].message.content;

    const botMessage = await prisma.message.create({
      data: { chatId, role: 'assistant', content: aiText },
    });

    return NextResponse.json({
      success: true,
      response: botMessage,
    });
  } catch (err) {
    console.error('Chat AI Error:', err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
