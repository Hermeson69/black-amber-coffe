import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { clients, profiles } from "@/db/schema";
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
      .from(clients)
      .leftJoin(profiles, eq(clients.id, profiles.clientId))
      .where(eq(clients.publicId, publicId))
      .limit(1);

    if (!result.length) {
      return null;
    }

    const { clients: clientRow, profiles: profileRow } = result[0];

    return new authModel(
      clientRow.id,
      clientRow.publicId,
      profileRow?.fullName ?? "",
      clientRow.email,
      clientRow.password,
      profileRow?.phone ?? undefined,
      clientRow.createdAt,
      clientRow.updatedAt,
    );
  }

  async update(data: authModel): Promise<authModel> {
    // Use transaction to ensure atomicity: both tables updated or neither
    const result = await this.db.transaction(async (tx) => {
      const [updatedClient] = await tx
        .update(clients)
        .set({
          email: data.email,
          password: data.password,
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
        })
        .where(eq(clients.publicId, data.publicId))
        .returning();

      if (!updatedClient) {
        throw new Error("Client not found");
      }

      await tx
        .update(profiles)
        .set({
          fullName: data.name,
          phone: data.phone,
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
        })
        .where(eq(profiles.clientId, updatedClient.id));

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
        .from(clients)
        .where(eq(clients.publicId, id))
        .limit(1);

      if (!client) {
        return;
      }

      // Delete profile first (foreign key constraint)
      await tx.delete(profiles).where(eq(profiles.clientId, client.id));

      // Then delete client
      await tx.delete(clients).where(eq(clients.id, client.id));
    });
  }
}
