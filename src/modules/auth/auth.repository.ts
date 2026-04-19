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
        name: data.name,
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
        fullName: inserted.name,
        phone: data.phone,
        avatarImage: null,
        createdAt: inserted.createdAt,
        updatedAt: inserted.updatedAt,
      };

      await tx.insert(Profiles).values(profileData);

      return new authModel(
        inserted.id,
        inserted.publicId,
        inserted.name,
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

    return new authModel(
      client.id,
      client.publicId,
      client.name,
      client.email,
      client.password,
      undefined,
      client.createdAt,
      client.updatedAt,
    );
  }

  async getById(id: string): Promise<authModel | null> {
    const [row] = await this.db
      .select({
        client: Clients,
        profile: Profiles,
      })
      .from(Clients)
      .leftJoin(Profiles, eq(Profiles.clientId, Clients.id))
      .where(eq(Clients.publicId, id))
      .limit(1);

    if (!row) {
      return null;
    }

    const { client, profile } = row;

    return new authModel(
      client.id,
      client.publicId,
      client.name,
      client.email,
      client.password,
      profile?.phone ?? undefined,
      client.createdAt,
      client.updatedAt,
    );
  }
}
