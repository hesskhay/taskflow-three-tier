import 'dotenv/config';
import { pool } from './db.js';
import { createApp } from './app.js';

const port = Number(process.env.PORT || 3000);
const server = createApp(pool).listen(port, '0.0.0.0', () => console.log(`TaskFlow API listening on ${port}`));

async function shutdown() {
  server.close(async () => { await pool.end(); process.exit(0); });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
