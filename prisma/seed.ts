import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const defaults = [
    { name: 'School', color: '#3B6E4F', subjectLabel: 'Subject' },
    { name: 'Nexora Solutions', color: '#2C4A7C', subjectLabel: 'Project' },
    { name: 'LG Esports', color: '#8C3B3B', subjectLabel: 'Area' },
    { name: 'Rental Management', color: '#8A6A2F', subjectLabel: 'Property' },
    { name: 'Personal', color: '#5B4E7A', subjectLabel: 'Area' },
  ];

  for (const c of defaults) {
    await prisma.category.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
  }

  console.log('Seeded default categories.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
