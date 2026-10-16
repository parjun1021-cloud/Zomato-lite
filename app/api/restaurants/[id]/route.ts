import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const restaurantId = Number(id);
  if (!Number.isInteger(restaurantId)) {
    return NextResponse.json({ error: 'restaurant does not exist' }, { status: 404 });
  }

  const restaurants = await sql`SELECT id, name, cuisine, area FROM restaurants WHERE id = ${restaurantId}`;
  if (restaurants.length === 0) {
    return NextResponse.json({ error: 'restaurant does not exist' }, { status: 404 });
  }
  const r = restaurants[0] as { id: number; name: string; cuisine: string; area: string };

  // Raw SQL only: AVG and COUNT, no stored average anywhere.
  const stats = await sql`
    SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), NULL)::float AS avg,
           COUNT(*)::int AS cnt
    FROM reviews WHERE restaurant_id = ${restaurantId}`;
  const s = stats[0] as { avg: number | null; cnt: number };

  const all = await sql`
    SELECT id, rating, comment, created_at
    FROM reviews WHERE restaurant_id = ${restaurantId}
    ORDER BY created_at DESC, id DESC`;

  type Row = { id: number; rating: number; comment: string; created_at: string };
  const rows = all as unknown as Row[];

  if (rows.length === 0) {
    // I decided: nothing yet means null average, zero count, null latest, empty list.
    return NextResponse.json({
      name: r.name,
      cuisine: r.cuisine,
      area: r.area,
      averageRating: null,
      totalReviews: 0,
      latestReview: null,
      reviews: [],
    });
  }

  const [latest, ...rest] = rows;
  const toApi = (x: Row) => ({ id: x.id, rating: x.rating, comment: x.comment, createdAt: x.created_at });

  return NextResponse.json({
    name: r.name,
    cuisine: r.cuisine,
    area: r.area,
    averageRating: s.avg,
    totalReviews: s.cnt,
    latestReview: toApi(latest),
    reviews: rest.map(toApi),
  });
}
