import fs from 'node:fs';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  const sql = neon(url);
  const file = path.join(process.cwd(), 'db', 'schema.sql');
  const text = fs.readFileSync(file, 'utf8');
  // Split on semicolon + newline to run statements one by one.
  // neon() serverless works as a tagged template, use .query() for raw strings.
  const statements = text.split(/;\s*\n/).map((s) => s.trim()).filter(Boolean);
  for (let s of statements) {
    if (!s.endsWith(';')) s += ';';
    await sql.query(s);
    console.log('OK:', s.slice(0, 70).replace(/\n/g, ' '));
  }
  const restaurants = await sql`SELECT id, name, cuisine, area FROM restaurants ORDER BY id`;
  console.log('restaurants:', JSON.stringify(restaurants));
  const reviews = await sql`SELECT id, restaurant_id, rating, comment, created_at FROM reviews ORDER BY created_at`;
  console.log('reviews:', JSON.stringify(reviews, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
