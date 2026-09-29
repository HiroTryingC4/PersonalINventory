import { prisma } from '@/lib/prisma';

type Template = {
  id: string;
  title: string;
  subject: string | null;
  startTime: string | null;
  endTime: string | null;
  categoryId: string;
  subtaskTitles: string[];
};

function isoOf(d: Date | null): string | null {
  return d ? d.toISOString().slice(0, 10) : null;
}

async function createInstance(tpl: Template, dueISO: string) {
  await prisma.task.create({
    data: {
      title: tpl.title,
      subject: tpl.subject,
      startTime: tpl.startTime,
      endTime: tpl.endTime,
      categoryId: tpl.categoryId,
      due: new Date(dueISO),
      dailyTemplateId: tpl.id,
      subtasks: {
        create: tpl.subtaskTitles.map((title, i) => ({ title, order: i })),
      },
    },
  });
}

// For each daily template, make sure there's exactly one live instance "due"
// today: if the latest instance is still open, just bump it forward to today
// (it never advances past today while incomplete); if it's already completed,
// spawn a fresh instance only once today hasn't been created yet.
export async function ensureDailyInstances(todayISO: string) {
  const templates = await prisma.dailyTemplate.findMany({
    include: { instances: { orderBy: { due: 'desc' }, take: 1 } },
  });

  for (const tpl of templates) {
    const latest = tpl.instances[0];
    if (!latest) {
      await createInstance(tpl, todayISO);
      continue;
    }
    const latestDueISO = isoOf(latest.due);
    if (!latest.completed) {
      if (latestDueISO !== todayISO) {
        await prisma.task.update({ where: { id: latest.id }, data: { due: new Date(todayISO) } });
      }
    } else if (latestDueISO !== todayISO) {
      await createInstance(tpl, todayISO);
    }
  }
}
