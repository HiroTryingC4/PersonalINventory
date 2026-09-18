import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();

  const subtask = await prisma.subtask.update({
    where: { id: params.id },
    data: { done: !!body.done },
  });

  const siblings = await prisma.subtask.findMany({ where: { taskId: subtask.taskId } });
  const allDone = siblings.length > 0 && siblings.every((s) => s.done);

  const task = await prisma.task.update({
    where: { id: subtask.taskId },
    data: { completed: allDone, completedAt: allDone ? new Date() : null },
    include: { subtasks: { orderBy: { order: 'asc' } } },
  });

  return NextResponse.json(task);
}
