import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 });
  }
  const b = (body ?? {}) as Record<string, unknown>;

  // 1. rating is an integer from 1 to 5
  const rating = b['rating'];
  if (!Number.isInteger(rating) || (rating as number) < 1 || (rating as number) > 5) {
    return NextResponse.json({ error: 'rating must be an integer from 1 to 5' }, { status: 400 });
  }

  // 2. comment is optional — trim if present, else empty string
  const commentRaw = b['comment'];
  const comment = typeof commentRaw === 'string' ? commentRaw.trim() : '';

  // 3. restaurantId refers to a restaurant that actually exists (database lookup)
  const restaurantId = b['restaurantId'];
  if (!Number.isInteger(restaurantId)) {
    return NextResponse.json({ error: 'restaurant does not exist' }, { status: 400 });
  }
  const found = await sql`SELECT id FROM restaurants WHERE id = ${restaurantId as number}`;
  if (found.length === 0) {
    return NextResponse.json({ error: 'restaurant does not exist' }, { status: 400 });
  }

  const rows = await sql`
    INSERT INTO reviews (restaurant_id, rating, comment)
    VALUES (${restaurantId as number}, ${rating as number}, ${comment})
    RETURNING id`;
  const reviewId = (rows[0] as { id: number }).id;
  return NextResponse.json({ success: true, reviewId }, { status: 201 });
}
