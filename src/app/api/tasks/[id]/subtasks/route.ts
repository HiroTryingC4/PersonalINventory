import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type IncomingSubtask = { id?: string; title: string };

// Replaces this task's whole subtask set in one call: updates rows that still
// have an id, creates ones that don't, deletes rows that were dropped, then
// recomputes the parent task's completion from the resulting set.
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const incoming: IncomingSubtask[] = body.subtasks || [];

  const existing = await prisma.task.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const keepIds = incoming.filter((s) => s.id).map((s) => s.id as string);

  await prisma.$transaction([
    prisma.subtask.deleteMany({
      where: { taskId: params.id, id: { notIn: keepIds.length ? keepIds : ['__none__'] } },
    }),
    ...incoming.map((s, i) =>
      s.id
        ? prisma.subtask.update({ where: { id: s.id }, data: { title: s.title, order: i } })
        : prisma.subtask.create({ data: { title: s.title, order: i, taskId: params.id } })
    ),
  ]);

  const remaining = await prisma.subtask.findMany({ where: { taskId: params.id } });
  const allDone = remaining.length > 0 && remaining.every((s) => s.done);

  const task = await prisma.task.update({
    where: { id: params.id },
    data: remaining.length
      ? { completed: allDone, completedAt: allDone ? new Date() : null }
      : {},
    include: { subtasks: { orderBy: { order: 'asc' } } },
  });

  return NextResponse.json(task);
}
