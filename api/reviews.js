const sql = require('../lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid JSON' }); }
  }
  body = body || {};

  const restaurantId = Number(body.restaurant_id);
  const rating = Number(body.rating);
  const comment = typeof body.comment === 'string' ? body.comment.trim() : '';

  try {
    const found = Number.isInteger(restaurantId)
      ? await sql`SELECT id FROM restaurants WHERE id = ${restaurantId}`
      : [];
    if (found.length === 0) return res.status(404).json({ error: 'restaurant id does not match any restaurant' });
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ error: 'rating must be a whole number from 1 to 5' });
    if (comment.length > 500) return res.status(400).json({ error: 'comment must be 500 characters or fewer' });

    const [review] = await sql`
      INSERT INTO reviews (restaurant_id, rating, comment)
      VALUES (${restaurantId}, ${rating}, ${comment})
      RETURNING id, restaurant_id, rating, comment, created_at`;

    const [stats] = await sql`
      SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)::float AS average_rating,
             COUNT(*)::int AS review_count
      FROM reviews WHERE restaurant_id = ${restaurantId}`;

    return res.status(201).json({ review, restaurant: { id: restaurantId, ...stats } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};
