import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { clients, profiles, workers, workerProfiles } from "@/db/schema";
import authModel from "@/modules/auth/auth.model";

export type UserType = "user" | "worker";

export interface AuthEntity {
  type: UserType;
  user: authModel;
}

interface PasswordReset {
  email: string;
  code: string;
  expiresAt: Date;
}

export default class authRepository {
  db: ReturnType<typeof drizzle>;
  private passwordResets: Map<string, PasswordReset> = new Map();

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db;
  }

  async create(data: authModel): Promise<authModel> {
    const result = await this.db.transaction(async (tx) => {
      const clientData: typeof clients.$inferInsert = {
        publicId: data.publicId,
        email: data.email,
        password: data.password,
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
      };

      const [inserted] = await tx
        .insert(clients)
        .values(clientData)
        .returning();

      const profileData: typeof profiles.$inferInsert = {
        clientId: inserted.id,
        fullName: data.name,
        phone: data.phone ?? null,
        avatarImage: null,
        createdAt: inserted.createdAt,
        updatedAt: inserted.updatedAt,
      };

      await tx.insert(profiles).values(profileData);

      return new authModel(
        inserted.id,
        inserted.publicId,
        data.name,
        inserted.email,
        inserted.password,
        data.phone,
        inserted.createdAt,
        inserted.updatedAt,
      );
    });

    return result;
  }

  async getByEmail(email: string): Promise<AuthEntity | null> {
    const clientResult = await this.db
      .select()
      .from(clients)
      .leftJoin(profiles, eq(clients.id, profiles.clientId))
      .where(eq(clients.email, email))
      .limit(1);

    if (clientResult.length) {
      const { clients: client, profiles: profile } = clientResult[0];
      return {
        type: "user",
        user: new authModel(
          client.id,
          client.publicId,
          profile?.fullName ?? "",
          client.email,
          client.password,
          profile?.phone ?? undefined,
          client.createdAt,
          client.updatedAt,
        ),
      };
    }

    const workerResult = await this.db
      .select()
      .from(workers)
      .leftJoin(workerProfiles, eq(workers.id, workerProfiles.workerId))
      .where(eq(workerProfiles.email, email))
      .limit(1);

    if (workerResult.length) {
      const { workers: worker, worker_profiles: profile } = workerResult[0];
      return {
        type: "worker",
        user: new authModel(
          worker.id,
          worker.publicId,
          profile?.fullName ?? "",
          profile?.email ?? "",
          profile?.password ?? "",
          profile?.phone ?? undefined,
          worker.createdAt,
          worker.updatedAt,
        ),
      };
    }

    return null;
  }

  async getById(id: string): Promise<AuthEntity | null> {
    const clientResult = await this.db
      .select()
      .from(clients)
      .leftJoin(profiles, eq(clients.id, profiles.clientId))
      .where(eq(clients.publicId, id))
      .limit(1);

    if (clientResult.length) {
      const { clients: client, profiles: profile } = clientResult[0];
      return {
        type: "user",
        user: new authModel(
          client.id,
          client.publicId,
          profile?.fullName ?? "",
          client.email,
          client.password,
          profile?.phone ?? undefined,
          client.createdAt,
          client.updatedAt,
        ),
      };
    }

    const workerResult = await this.db
      .select()
      .from(workers)
      .leftJoin(workerProfiles, eq(workers.id, workerProfiles.workerId))
      .where(eq(workers.publicId, id))
      .limit(1);

    if (workerResult.length) {
      const { workers: worker, worker_profiles: profile } = workerResult[0];
      return {
        type: "worker",
        user: new authModel(
          worker.id,
          worker.publicId,
          profile?.fullName ?? "",
          profile?.email ?? "",
          profile?.password ?? "",
          profile?.phone ?? undefined,
          worker.createdAt,
          worker.updatedAt,
        ),
      };
    }

    return null;
  }

  async createPasswordReset(
    email: string,
    code: string,
    expiresAt: Date,
  ): Promise<void> {
    this.passwordResets.set(code, {
      email,
      code,
      expiresAt,
    });
  }

  async getPasswordReset(code: string): Promise<PasswordReset | null> {
    const reset = this.passwordResets.get(code);
    if (!reset) {
      return null;
    }

    // Verifica se não expirou
    if (new Date() > reset.expiresAt) {
      this.passwordResets.delete(code);
      return null;
    }

    return reset;
  }

  async deletePasswordReset(code: string): Promise<void> {
    this.passwordResets.delete(code);
  }

  async updateUserPassword(
    userId: number,
    hashedPassword: string,
  ): Promise<void> {
    // Atualiza a senha no banco de dados
    await this.db
      .update(clients)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(clients.id, userId));
  }
}
