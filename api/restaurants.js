const sql = require('../lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const restaurants = await sql`
      SELECT r.id, r.name, r.address, r.type, r.cuisine,
             COALESCE(ROUND(AVG(v.rating)::numeric, 1), 0)::float AS average_rating,
             COUNT(v.id)::int AS review_count
      FROM restaurants r
      LEFT JOIN reviews v ON v.restaurant_id = r.id
      GROUP BY r.id
      ORDER BY r.id`;

    const reviews = await sql`
      SELECT id, restaurant_id, rating, comment, created_at
      FROM reviews
      ORDER BY created_at DESC, id DESC`;

    const byRestaurant = new Map();
    for (const { restaurant_id, ...review } of reviews) {
      if (!byRestaurant.has(restaurant_id)) byRestaurant.set(restaurant_id, []);
      byRestaurant.get(restaurant_id).push(review);
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      restaurants: restaurants.map((r) => ({ ...r, reviews: byRestaurant.get(r.id) || [] })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};
