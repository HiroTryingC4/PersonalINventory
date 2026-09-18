import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const category = await prisma.category.update({
    where: { id: params.id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.color !== undefined ? { color: body.color } : {}),
      ...(body.subjectLabel !== undefined ? { subjectLabel: body.subjectLabel } : {}),
    },
  });
  return NextResponse.json(category);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const taskCount = await prisma.task.count({ where: { categoryId: params.id } });
  if (taskCount > 0) {
    return NextResponse.json(
      { error: 'This category still has tasks in it. Move or delete those tasks first.' },
      { status: 409 }
    );
  }
  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
