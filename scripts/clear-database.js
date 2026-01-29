// Clear all data from the database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('Clearing database...\n');

  try {
    // Delete in correct order (respect foreign key constraints)
    console.log('Deleting ContentUsages...');
    const usagesDeleted = await prisma.contentUsage.deleteMany({});
    console.log(`✓ Deleted ${usagesDeleted.count} content usages`);

    console.log('Deleting ResumeDocuments...');
    const docsDeleted = await prisma.resumeDocument.deleteMany({});
    console.log(`✓ Deleted ${docsDeleted.count} documents`);

    console.log('Deleting ContentBlocks...');
    const blocksDeleted = await prisma.contentBlock.deleteMany({});
    console.log(`✓ Deleted ${blocksDeleted.count} blocks`);

    console.log('\n✅ Database cleared successfully!');
    console.log('You can now start fresh with an empty database.');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
