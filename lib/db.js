const { neon } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Add it in Vercel > Settings > Environment Variables.');
}

module.exports = neon(process.env.DATABASE_URL);
