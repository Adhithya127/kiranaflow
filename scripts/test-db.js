const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  console.log("Attempting to connect to Neon PostgreSQL...");
  console.log("This may take 10-30 seconds if the database is waking up from suspension.");

  try {
    await prisma.$connect();
    console.log("Connected successfully!");
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`User count: ${userCount}`);
    
    await prisma.$disconnect();
    console.log("Done.");
  } catch (error) {
    console.error("Connection failed:", error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
