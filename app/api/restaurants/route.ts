import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  // One query for averages + counts. No stored average anywhere.
  const rows = await sql`
    SELECT r.id, r.name, r.cuisine, r.area,
           COALESCE(ROUND(AVG(v.rating)::numeric, 1), NULL)::float AS avg,
           COUNT(v.id)::int AS cnt
    FROM restaurants r
    LEFT JOIN reviews v ON v.restaurant_id = r.id
    GROUP BY r.id
    ORDER BY r.id`;
  type R = { id: number; name: string; cuisine: string; area: string; avg: number | null; cnt: number };
  return NextResponse.json({
    restaurants: (rows as unknown as R[]).map((r) => ({
      id: r.id,
      name: r.name,
      cuisine: r.cuisine,
      area: r.area,
      averageRating: r.avg,
      totalReviews: r.cnt,
    })),
  });
}
