import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { Clients, Profiles } from "@/db/schema";
import authModel from "@/modules/auth/auth.model";

export default class userRepository {
  db: ReturnType<typeof drizzle>;

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db;
  }

  /**
   * Get user by publicId with profile data in single query
   */
  async getByPublicId(publicId: string): Promise<authModel | null> {
    const result = await this.db
      .select()
      .from(Clients)
      .leftJoin(Profiles, eq(Clients.id, Profiles.clientId))
      .where(eq(Clients.publicId, publicId))
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

  async update(data: authModel): Promise<authModel> {
    // Use transaction to ensure atomicity: both tables updated or neither
    const result = await this.db.transaction(async (tx) => {
      const [updatedClient] = await tx
        .update(Clients)
        .set({
          email: data.email,
          password: data.password,
          updatedAt: data.updatedAt,
        })
        .where(eq(Clients.publicId, data.publicId))
        .returning();

      if (!updatedClient) {
        throw new Error("Client not found");
      }

      await tx
        .update(Profiles)
        .set({
          fullName: data.name,
          phone: data.phone,
          updatedAt: data.updatedAt,
        })
        .where(eq(Profiles.clientId, updatedClient.id));

      return new authModel(
        updatedClient.id,
        updatedClient.publicId,
        data.name,
        updatedClient.email,
        updatedClient.password,
        data.phone,
        updatedClient.createdAt,
        updatedClient.updatedAt,
      );
    });

    return result;
  }

  async deleteByPublicId(id: string): Promise<void> {
    // Use transaction to ensure both profile and client are deleted or neither
    await this.db.transaction(async (tx) => {
      const [client] = await tx
        .select()
        .from(Clients)
        .where(eq(Clients.publicId, id))
        .limit(1);

      if (!client) {
        return;
      }

      // Delete profile first (foreign key constraint)
      await tx.delete(Profiles).where(eq(Profiles.clientId, client.id));

      // Then delete client
      await tx.delete(Clients).where(eq(Clients.id, client.id));
    });
  }
}
