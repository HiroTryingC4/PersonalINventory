import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const existing = await prisma.task.findUnique({
    where: { id: params.id },
    include: { subtasks: true },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.subject !== undefined) data.subject = body.subject || null;
  if (body.due !== undefined) data.due = body.due ? new Date(body.due) : null;
  if (body.startTime !== undefined) data.startTime = body.startTime || null;
  if (body.endTime !== undefined) data.endTime = body.endTime || null;
  if (body.categoryId !== undefined) data.categoryId = body.categoryId;

  // A task with subtasks can only complete by finishing all of them —
  // manual completion toggling is only honored when there are none.
  if (body.completed !== undefined && existing.subtasks.length === 0) {
    data.completed = body.completed;
    data.completedAt = body.completed ? new Date() : null;
  }

  // Editing a daily instance's identity also updates the recurring template,
  // so tomorrow's fresh instance reflects the edit too.
  if (existing.dailyTemplateId) {
    const templateData: Record<string, unknown> = {};
    if (body.title !== undefined) templateData.title = body.title;
    if (body.subject !== undefined) templateData.subject = body.subject || null;
    if (body.startTime !== undefined) templateData.startTime = body.startTime || null;
    if (body.endTime !== undefined) templateData.endTime = body.endTime || null;
    if (body.categoryId !== undefined) templateData.categoryId = body.categoryId;
    if (Object.keys(templateData).length) {
      await prisma.dailyTemplate.update({ where: { id: existing.dailyTemplateId }, data: templateData });
    }
  }

  const task = await prisma.task.update({
    where: { id: params.id },
    data,
    include: { subtasks: { orderBy: { order: 'asc' } } },
  });
  return NextResponse.json(task);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const task = await prisma.task.findUnique({ where: { id: params.id }, select: { dailyTemplateId: true } });
  if (task?.dailyTemplateId) {
    // Deleting a daily instance stops the whole recurrence, not just today's copy.
    await prisma.dailyTemplate.delete({ where: { id: task.dailyTemplateId } });
  } else {
    await prisma.task.delete({ where: { id: params.id } });
  }
  return NextResponse.json({ ok: true });
}
