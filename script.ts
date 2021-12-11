import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// A `main` function so that you can use async/await
async function main() {
  const result = await prisma.user.update({
    data: {
      name: 'Ronaldo Stopa ED'
    },
    where: {
      id: 5
    }
  });

  console.log(result);
}

main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
