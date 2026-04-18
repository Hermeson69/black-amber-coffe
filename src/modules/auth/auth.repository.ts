import { drizzle } from "drizzle-orm/postgres-js";
import {eq} from "drizzle-orm"
import { Clients } from "../../db/schema";
import authModel from "./auth.model";

export default class authRepository {
  db: ReturnType<typeof drizzle>;

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db;
  }

  async create(data: authModel): Promise<authModel> {
    const clientData: typeof Clients.$inferInsert = {
      publicId: data.publicId,
      name: data.name,
      email: data.email,
      password: data.password,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      lastLogin: data.lastLogin,
    };

    const [inserted] = await this.db
      .insert(Clients)
      .values(clientData)
      .returning();

    return new authModel(
      inserted.id,
      inserted.publicId,
      inserted.name,
      inserted.email,
      inserted.password,
      inserted.createdAt,
      inserted.updatedAt,
    );
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
      client.createdAt,
      client.updatedAt,
    );
  }
}
