import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { clients, profiles } from "@/db/schema";
import authModel from "@/modules/auth/auth.model";

export default class authRepository {
  db: ReturnType<typeof drizzle>;

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db;
  }

  async create(data: authModel): Promise<authModel> {
    // Use transaction to ensure atomicity: either both client and profile are created, or neither
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

  async getByEmail(email: string): Promise<authModel | null> {
    // Single query with leftJoin to avoid N+1 problem
    const result = await this.db
      .select()
      .from(clients)
      .leftJoin(profiles, eq(clients.id, profiles.clientId))
      .where(eq(clients.email, email))
      .limit(1);

    if (!result.length) {
      return null;
    }

    const { clients: client, profiles: profile } = result[0];

    return new authModel(
      client.id,
      client.publicId,
      profile?.fullName ?? "",
      client.email,
      client.password,
      profile?.phone ?? undefined,
      client.createdAt,
      client.updatedAt,
    );
  }

  async getById(id: string): Promise<authModel | null> {
    // Single query with leftJoin to avoid N+1 problem
    const result = await this.db
      .select()
      .from(clients)
      .leftJoin(profiles, eq(clients.id, profiles.clientId))
      .where(eq(clients.publicId, id))
      .limit(1);

    if (!result.length) {
      return null;
    }

    const { clients: client, profiles: profile } = result[0];

    return new authModel(
      client.id,
      client.publicId,
      profile?.fullName ?? "",
      client.email,
      client.password,
      profile?.phone ?? undefined,
      client.createdAt,
      client.updatedAt,
    );
  }
}
