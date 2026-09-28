import "dotenv/config";

import { hashPassword } from "../lib/auth/password";
import { calculateRoi, type RoiInput } from "../lib/roi";
import { db } from "./db";

interface SeedUser {
  email: string;
  username: string;
  calculations: RoiInput[];
}

const SEED_PASSWORD = "password123";

const SEED_USERS: SeedUser[] = [
  {
    email: "demo@adforecast.test",
    username: "demo",
    calculations: [
      { productPrice: 150_000, averageOrderValue: 175_000, adSpend: 5_000_000, costPerResult: 50_000 },
      { productPrice: 250_000, averageOrderValue: 275_000, adSpend: 12_000_000, costPerResult: 80_000 },
      { productPrice: 99_000, averageOrderValue: 120_000, adSpend: 3_000_000, costPerResult: 40_000 },
    ],
  },
  {
    email: "sari@adforecast.test",
    username: "sari",
    calculations: [
      { productPrice: 300_000, averageOrderValue: 320_000, adSpend: 8_000_000, costPerResult: 60_000 },
    ],
  },
];

async function seedUser(seed: SeedUser): Promise<void> {
  const passwordHash = await hashPassword(SEED_PASSWORD);

  const existing = await db.orm.public.User.where({ email: seed.email }).first();
  const user = existing
    ? await db.orm.public.User
        .where({ id: existing.id })
        .select("id", "email", "username")
        .update({ username: seed.username, passwordHash })
    : await db.orm.public.User
        .select("id", "email", "username")
        .create({ email: seed.email, username: seed.username, passwordHash });

  if (!user) {
    throw new Error(`Could not upsert seed user ${seed.email}`);
  }

  // Reset this user's calculations so re-running the seed stays idempotent.
  await db.orm.public.Calculation.where({ userId: user.id }).delete();

  for (const input of seed.calculations) {
    const result = calculateRoi(input);

    await db.orm.public.Calculation.create({
      userId: user.id,
      productPrice: input.productPrice,
      averageOrderValue: input.averageOrderValue,
      adSpend: input.adSpend,
      costPerResult: input.costPerResult,
      resultCount: result.resultCount,
      revenue: result.revenue,
      profit: result.profit,
      roi: result.roi,
      revenuePerResult: result.revenuePerResult,
      marginPerResult: result.marginPerResult,
    });
  }

  console.log(`  ${seed.email}  (${seed.calculations.length} calculation(s))`);
}

async function main(): Promise<void> {
  console.log("Seeding database...");
  for (const seed of SEED_USERS) {
    await seedUser(seed);
  }
  console.log(`\nDone. Sign in with any account above — password: ${SEED_PASSWORD}`);
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
