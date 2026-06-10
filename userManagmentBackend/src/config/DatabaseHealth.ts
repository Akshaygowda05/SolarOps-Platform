import { prisma } from "./primsaConfig";

export async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database Connected");
  } catch (error) {
    console.error("❌ Database Connection Failed", error);
  }
}

