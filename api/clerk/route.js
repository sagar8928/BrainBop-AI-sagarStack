import { Webhook } from 'svix';
import { NextResponse } from 'next/server';
import prisma from '@/app/models/prisma';
import { headers } from 'next/headers';

export async function POST(req) {
  const wh = new Webhook(process.env.SIGNING_SECRET);

  const svixHeaders = {
    'svix-id': headers().get('svix-id'),
    'svix-timestamp': headers().get('svix-timestamp'),
    'svix-signature': headers().get('svix-signature'),
  };

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const { data, type } = wh.verify(body, svixHeaders);

  const userData = {
    id: data.id,
    email: data.email_addresses?.[0]?.email_address || null,
    name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
    image: data.image_url || null,
  };

  switch (type) {
    case 'user.created':
      await prisma.user.upsert({
        where: { id: data.id },
        create: userData,
        update: userData,
      });
      break;

    case 'user.updated':
      await prisma.user.upsert({
        where: { id: data.id },
        create: userData,
        update: userData,
      });
      break;

    case 'user.deleted':
      await prisma.user.deleteMany({
        where: { id: data.id },
      });
      break;
  }

  return NextResponse.json({ message: 'Event received' });
}
