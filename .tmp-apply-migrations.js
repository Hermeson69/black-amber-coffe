require('dotenv').config();
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL);

(async () => {
  try {
    // 1. Remove colunas de workers
    await sql`ALTER TABLE "workers" DROP COLUMN IF EXISTS "email"`;
    console.log('✅ Dropped email from workers');
    
    await sql`ALTER TABLE "workers" DROP COLUMN IF EXISTS "password"`;
    console.log('✅ Dropped password from workers');
    
    // 2. Create worker_profiles table
    await sql`
      CREATE TABLE IF NOT EXISTS "worker_profiles" (
        "id" serial PRIMARY KEY NOT NULL,
        "worker_id" integer NOT NULL REFERENCES "workers"("id"),
        "full_name" text NOT NULL,
        "phone" text,
        "avatar_image" text,
        "created_at" text NOT NULL,
        "updated_at" text NOT NULL
      )
    `;
    console.log('✅ Created worker_profiles table');
    
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
  
  await sql.end();
})();
