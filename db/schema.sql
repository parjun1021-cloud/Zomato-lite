DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS restaurants;

CREATE TABLE restaurants (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  cuisine   TEXT NOT NULL,
  area      TEXT NOT NULL,
  type      TEXT NOT NULL DEFAULT 'Dine In'
);

CREATE TABLE reviews (
  id            SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed one restaurant
INSERT INTO restaurants (id, name, cuisine, area, type)
VALUES (1, 'Sainik Sweets', 'Indian', 'Ashok Nagar', 'Dine In')
ON CONFLICT (id) DO NOTHING;

-- Seed three reviews a few days apart so "latest" is meaningful
INSERT INTO reviews (id, restaurant_id, rating, comment, created_at)
VALUES
  (101, 1, 5, 'Paneer burrito is unreal', NOW() - INTERVAL '8 days'),
  (102, 1, 4, 'Good, but slow service', NOW() - INTERVAL '6 days'),
  (103, 1, 4, 'Solid. Would repeat.', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

SELECT setval(pg_get_serial_sequence('restaurants', 'id'), (SELECT MAX(id) FROM restaurants));
SELECT setval(pg_get_serial_sequence('reviews', 'id'), (SELECT MAX(id) FROM reviews));
