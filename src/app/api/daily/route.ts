import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.title || !body.categoryId || !body.due) {
    return NextResponse.json({ error: 'title, categoryId and due are required' }, { status: 400 });
  }

  const subtaskTitles: string[] = (body.subtasks || [])
    .map((s: { title: string }) => s.title)
    .filter(Boolean);

  const template = await prisma.dailyTemplate.create({
    data: {
      title: body.title,
      subject: body.subject || null,
      startTime: body.startTime || null,
      endTime: body.endTime || null,
      categoryId: body.categoryId,
      subtaskTitles,
    },
  });

  const task = await prisma.task.create({
    data: {
      title: template.title,
      subject: template.subject,
      startTime: template.startTime,
      endTime: template.endTime,
      categoryId: template.categoryId,
      due: new Date(body.due),
      dailyTemplateId: template.id,
      subtasks: { create: subtaskTitles.map((title, i) => ({ title, order: i })) },
    },
    include: { subtasks: { orderBy: { order: 'asc' } } },
  });

  return NextResponse.json(task, { status: 201 });
}
