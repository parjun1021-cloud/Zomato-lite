CREATE TABLE IF NOT EXISTS restaurants (
  id      INTEGER PRIMARY KEY,
  name    TEXT NOT NULL,
  address TEXT NOT NULL,
  type    TEXT NOT NULL,
  cuisine TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id            INTEGER GENERATED ALWAYS AS IDENTITY (START WITH 101) PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON reviews(restaurant_id);

INSERT INTO restaurants (id, name, address, type, cuisine)
VALUES (1, 'Sainik Sweets', 'Ashok Nagar', 'Dine In', 'Indian')
ON CONFLICT (id) DO NOTHING;

INSERT INTO reviews (restaurant_id, rating, comment)
SELECT 1, 5, 'Dosa was good'
WHERE NOT EXISTS (SELECT 1 FROM reviews);
