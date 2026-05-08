import { db } from "../config/database";
import { Clients, Profiles, Workers, WorkerProfiles } from "../db/schema";
import SecurityUtils from "../core/security";
import { generateId } from "../core/gereteId";
import { eq } from "drizzle-orm";

const workerSeedData = [
  {
    fullName: "Admin Black Amber",
    email: "admin@blackamber.com",
    phone: "11999999999",
    role: "ADMIN" as const,
  },
  {
    fullName: "João Barista",
    email: "barista@blackamber.com",
    phone: "11988888888",
    role: "BARISTA" as const,
  },
  {
    fullName: "Carlos Barman",
    email: "barman@blackamber.com",
    phone: "11977777777",
    role: "BARMAN" as const,
  },
  {
    fullName: "Maria Garçonete",
    email: "waiter@blackamber.com",
    phone: "11966666666",
    role: "WAITER" as const,
  },
];

export async function seed() {
  console.log("🌱 Iniciando seed...");

  try {
    // Make seed idempotent per-record: create workers that are missing and ensure test client exists
    const existingWorkerProfile = await db
      .select()
      .from(WorkerProfiles)
      .limit(1);

    const now = new Date().toISOString();
    const hashedPassword = await SecurityUtils.hashPassword("123456");

    // Create missing workers and their profiles
    if (existingWorkerProfile.length === 0) {
      await db.transaction(async (tx) => {
        console.log("👷 Criando workers...");

        const workers = await tx
          .insert(Workers)
          .values(
            workerSeedData.map((worker) => ({
              publicId: generateId(),
              role: worker.role,
              salary: "0",
              isActive: true,
              createdAt: now,
              updatedAt: now,
            })),
          )
          .returning();

        await tx.insert(WorkerProfiles).values(
          workers.map((worker, index) => ({
            workerId: worker.id,
            email: workerSeedData[index].email,
            password: hashedPassword,
            fullName: workerSeedData[index].fullName,
            phone: workerSeedData[index].phone,
            avatarImage: null,
            createdAt: now,
            updatedAt: now,
          })),
        );
      });
    } else {
      // Ensure each expected worker/profile exists (insert missing ones individually)
      console.log("🔍 Verificando workers existentes e inserindo ausentes...");
      for (const seed of workerSeedData) {
        const found = await db
          .select()
          .from(WorkerProfiles)
          .where(eq(WorkerProfiles.email, seed.email))
          .limit(1);

        if (!found.length) {
          await db.transaction(async (tx) => {
            const [worker] = await tx
              .insert(Workers)
              .values({
                publicId: generateId(),
                role: seed.role,
                salary: "0",
                isActive: true,
                createdAt: now,
                updatedAt: now,
              })
              .returning();

            await tx.insert(WorkerProfiles).values({
              workerId: worker.id,
              email: seed.email,
              password: hashedPassword,
              fullName: seed.fullName,
              phone: seed.phone,
              avatarImage: null,
              createdAt: now,
              updatedAt: now,
            });
          });
          console.log(`+ Inserido worker/profile ${seed.email}`);
        }
      }
    }

    // Ensure test client exists (insert if missing)
    const existingClient = await db
      .select()
      .from(Clients)
      .where(eq(Clients.email, "cliente@teste.com"))
      .limit(1);

    if (!existingClient.length) {
      console.log("👤 Criando cliente de teste...");
      await db.transaction(async (tx) => {
        const [client] = await tx
          .insert(Clients)
          .values({
            publicId: generateId(),
            email: "cliente@teste.com",
            password: hashedPassword,
            createdAt: now,
            updatedAt: now,
          })
          .returning();

        await tx.insert(Profiles).values({
          clientId: client.id,
          fullName: "Cliente Teste",
          phone: "11955555555",
          avatarImage: null,
          createdAt: now,
          updatedAt: now,
        });
      });
    }

    console.log("✅ Seed concluída com sucesso!");
    console.log("\n📧 Credenciais de teste:");
    console.log("   Admin: admin@blackamber.com / 123456");
    console.log("   Barista: barista@blackamber.com / 123456");
    console.log("   Barman: barman@blackamber.com / 123456");
    console.log("   Waiter: waiter@blackamber.com / 123456");
    console.log("   Cliente: cliente@teste.com / 123456");
  } catch (error) {
    console.error("❌ Erro na seed:", error);
  }
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Falha ao executar seed:", error);
      process.exit(1);
    });
}
