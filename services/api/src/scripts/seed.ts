import { ensureSeedProducts } from "../lib/seed";
import { prisma } from "../lib/prisma";

async function run() {
  const force = process.argv.includes("--force");
  const result = await ensureSeedProducts(force);
  console.log("Seed completed", result);
}

run()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
