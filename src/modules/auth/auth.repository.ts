import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { Clients, Profiles } from "../../db/schema";
import authModel from "./auth.model";

export default class authRepository {
  db: ReturnType<typeof drizzle>;

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db;
  }

  async create(data: authModel): Promise<authModel> {
    // Use transaction to ensure atomicity: either both client and profile are created, or neither
    const result = await this.db.transaction(async (tx) => {
      const clientData: typeof Clients.$inferInsert = {
        publicId: data.publicId,
        email: data.email,
        password: data.password,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };

      const [inserted] = await tx
        .insert(Clients)
        .values(clientData)
        .returning();

      const profileData: typeof Profiles.$inferInsert = {
        clientId: inserted.id,
        fullName: data.name,
        phone: data.phone ?? null,
        avatarImage: null,
        createdAt: inserted.createdAt,
        updatedAt: inserted.updatedAt,
      };

      await tx.insert(Profiles).values(profileData);

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
    const [client] = await this.db
      .select()
      .from(Clients)
      .where(eq(Clients.email, email))
      .limit(1);

    if (!client) {
      return null;
    }

    // Try to fetch profile if the table exists (avoid failing when profiles table is missing)
    let profile: any = null;
    try {
      const [p] = await this.db
        .select()
        .from(Profiles)
        .where(eq(Profiles.clientId, client.id))
        .limit(1);
      profile = p ?? null;
    } catch (e) {
      // If profile table doesn't exist or query fails, ignore and fall back to client-only data
      profile = null;
    }

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
    const [client] = await this.db
      .select()
      .from(Clients)
      .where(eq(Clients.publicId, id))
      .limit(1);

    if (!client) {
      return null;
    }

    let profile: any = null;
    try {
      const [p] = await this.db
        .select()
        .from(Profiles)
        .where(eq(Profiles.clientId, client.id))
        .limit(1);
      profile = p ?? null;
    } catch (e) {
      profile = null;
    }

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
