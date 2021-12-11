import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.post.update({
    data: {
      author: {
        connect: {
          id: 1
        }
      }
    },
    where: {
      id: 1
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
