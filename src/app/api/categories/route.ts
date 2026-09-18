import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { createdAt: 'asc' } });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.name || typeof body.name !== 'string') {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }
  const category = await prisma.category.create({
    data: {
      name: body.name,
      color: body.color || '#5B5F57',
      subjectLabel: body.subjectLabel || 'Tag',
    },
  });
  return NextResponse.json(category, { status: 201 });
}
