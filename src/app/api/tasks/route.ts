import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const completed = searchParams.get('completed');
  const categoryId = searchParams.get('categoryId');

  const tasks = await prisma.task.findMany({
    where: {
      ...(completed !== null ? { completed: completed === 'true' } : {}),
      ...(categoryId ? { categoryId } : {}),
    },
    include: { subtasks: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.title || !body.categoryId) {
    return NextResponse.json({ error: 'title and categoryId are required' }, { status: 400 });
  }
  const task = await prisma.task.create({
    data: {
      title: body.title,
      subject: body.subject || null,
      due: body.due ? new Date(body.due) : null,
      startTime: body.startTime || null,
      endTime: body.endTime || null,
      categoryId: body.categoryId,
      subtasks: {
        create: (body.subtasks || []).map((s: { title: string }, i: number) => ({
          title: s.title,
          order: i,
        })),
      },
    },
    include: { subtasks: { orderBy: { order: 'asc' } } },
  });
  return NextResponse.json(task, { status: 201 });
}
