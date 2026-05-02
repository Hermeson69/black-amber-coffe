import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { Clients, Profiles } from "@/db/schema";
import authModel from "@/modules/auth/auth.model";

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
    // Single query with leftJoin to avoid N+1 problem
    const result = await this.db
      .select()
      .from(Clients)
      .leftJoin(Profiles, eq(Clients.id, Profiles.clientId))
      .where(eq(Clients.email, email))
      .limit(1);

    if (!result.length) {
      return null;
    }

    const { clients, profiles } = result[0];

    return new authModel(
      clients.id,
      clients.publicId,
      profiles?.fullName ?? "",
      clients.email,
      clients.password,
      profiles?.phone ?? undefined,
      clients.createdAt,
      clients.updatedAt,
    );
  }

  async getById(id: string): Promise<authModel | null> {
    // Single query with leftJoin to avoid N+1 problem
    const result = await this.db
      .select()
      .from(Clients)
      .leftJoin(Profiles, eq(Clients.id, Profiles.clientId))
      .where(eq(Clients.publicId, id))
      .limit(1);

    if (!result.length) {
      return null;
    }

    const { clients, profiles } = result[0];

    return new authModel(
      clients.id,
      clients.publicId,
      profiles?.fullName ?? "",
      clients.email,
      clients.password,
      profiles?.phone ?? undefined,
      clients.createdAt,
      clients.updatedAt,
    );
  }
}
