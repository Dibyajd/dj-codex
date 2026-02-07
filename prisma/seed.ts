import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

async function main() {
  const pwd = await bcrypt.hash("Demo@1234", 10);

  const org = await prisma.organization.upsert({
    where: { id: "demo-org" },
    update: {},
    create: {
      id: "demo-org",
      name: "Northstar Labs",
      industryPrimary: "Software",
      industrySecondary: "Fintech",
      revenueBand: "$100M-$500M",
      growthStage: "Scale",
      employeeSize: 1800,
      marketGeography: "North America",
      businessModel: "SaaS"
    }
  });

  await prisma.user.upsert({
    where: { email: "hrbp@northstarlabs.com" },
    update: {},
    create: {
      name: "Demo HRBP",
      email: "hrbp@northstarlabs.com",
      hashedPassword: pwd,
      role: Role.HRBP,
      organizationId: org.id
    }
  });

  await prisma.user.upsert({
    where: { email: "admin@northstarlabs.com" },
    update: {},
    create: {
      name: "Demo Admin",
      email: "admin@northstarlabs.com",
      hashedPassword: pwd,
      role: Role.ADMIN,
      organizationId: org.id
    }
  });

  const benchmarkPath = path.join(process.cwd(), "data", "benchmarks.json");
  const content = fs.readFileSync(benchmarkPath, "utf8");
  const benchmarkRows = JSON.parse(content) as Array<Record<string, string>>;

  for (const row of benchmarkRows) {
    await prisma.comparatorCompany.upsert({
      where: { id: `${row.company}-${row.levelCode}`.replace(/\s+/g, "-").toLowerCase() },
      update: {
        industry: row.industry,
        revenueBand: row.revenueBand,
        employeeRange: row.employeeRange,
        growthStage: row.growthStage,
        geography: row.geography,
        businessModel: row.businessModel,
        source: row.source,
        confidenceWeight: 0.8
      },
      create: {
        id: `${row.company}-${row.levelCode}`.replace(/\s+/g, "-").toLowerCase(),
        name: row.company,
        industry: row.industry,
        revenueBand: row.revenueBand,
        employeeRange: row.employeeRange,
        growthStage: row.growthStage,
        geography: row.geography,
        businessModel: row.businessModel,
        source: row.source,
        confidenceWeight: 0.8
      }
    });
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
