import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.appointment.deleteMany();
  await prisma.therapy.deleteMany();
  await prisma.ailment.deleteMany();
  await prisma.agent.deleteMany();

  // Create ailments
  const ailments = await Promise.all([
    prisma.ailment.create({
      data: {
        name: 'Anxiety',
        description: 'Persistent worry and nervousness',
        category: 'Mental Health'
      }
    }),
    prisma.ailment.create({
      data: {
        name: 'Depression',
        description: 'Persistent low mood and loss of interest',
        category: 'Mental Health'
      }
    }),
    prisma.ailment.create({
      data: {
        name: 'Insomnia',
        description: 'Difficulty falling or staying asleep',
        category: 'Sleep Disorders'
      }
    }),
    prisma.ailment.create({
      data: {
        name: 'Chronic Pain',
        description: 'Long-term pain conditions',
        category: 'Physical Health'
      }
    }),
    prisma.ailment.create({
      data: {
        name: 'Stress',
        description: 'Overwhelming stress from work or life',
        category: 'Mental Health'
      }
    })
  ]);

  // Create therapies
  const therapies = await Promise.all([
    prisma.therapy.create({
      data: {
        name: 'Cognitive Behavioral Therapy',
        description: 'Evidence-based therapy focusing on thought patterns and behaviors',
        duration: 60,
        staffRequired: 1,
        ailments: {
          connect: [
            { id: ailments[0].id }, // Anxiety
            { id: ailments[1].id }, // Depression
            { id: ailments[4].id }  // Stress
          ]
        }
      }
    }),
    prisma.therapy.create({
      data: {
        name: 'Mindfulness Meditation',
        description: 'Guided meditation to reduce stress and improve focus',
        duration: 45,
        staffRequired: 1,
        ailments: {
          connect: [
            { id: ailments[0].id }, // Anxiety
            { id: ailments[2].id }, // Insomnia
            { id: ailments[4].id }  // Stress
          ]
        }
      }
    }),
    prisma.therapy.create({
      data: {
        name: 'Physical Therapy',
        description: 'Movement and exercise-based therapy for pain management',
        duration: 50,
        staffRequired: 1,
        ailments: {
          connect: [
            { id: ailments[3].id }  // Chronic Pain
          ]
        }
      }
    }),
    prisma.therapy.create({
      data: {
        name: 'Sleep Hygiene Coaching',
        description: 'Personalized guidance to improve sleep quality and duration',
        duration: 30,
        staffRequired: 1,
        ailments: {
          connect: [
            { id: ailments[2].id }  // Insomnia
          ]
        }
      }
    }),
    prisma.therapy.create({
      data: {
        name: 'Counseling Session',
        description: 'One-on-one counseling for emotional support and guidance',
        duration: 60,
        staffRequired: 1,
        ailments: {
          connect: [
            { id: ailments[0].id }, // Anxiety
            { id: ailments[1].id }, // Depression
            { id: ailments[4].id }  // Stress
          ]
        }
      }
    })
  ]);

  console.log(`Created ${ailments.length} ailments and ${therapies.length} therapies`);
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
