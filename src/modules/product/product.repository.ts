import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { products } from "@/db/schema";

export default class ProductRepository {
  db: ReturnType<typeof drizzle>;

  constructor(db: ReturnType<typeof drizzle>) {
    this.db = db;
  }

  async getById(id: number) {
    const rows = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    if (!rows.length) return null;
    return rows[0];
  }
}
