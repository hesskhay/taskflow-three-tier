import express from 'express';
import cors from 'cors';

const allowedStatuses = new Set(['todo', 'in_progress', 'done']);
const allowedPriorities = new Set(['low', 'medium', 'high']);

export function createApp(db) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));
  app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));

  app.get('/health/live', (_req, res) => res.json({ status: 'alive' }));
  app.get('/health/ready', async (_req, res) => {
    try { await db.query('SELECT 1'); res.json({ status: 'ready' }); }
    catch { res.status(503).json({ status: 'unavailable' }); }
  });

  app.get('/api/tasks', async (_req, res, next) => {
    try {
      const result = await db.query('SELECT id, title, description, status, priority, created_at, updated_at FROM tasks ORDER BY created_at DESC');
      res.json(result.rows);
    } catch (error) { next(error); }
  });

  app.get('/api/stats', async (_req, res, next) => {
    try {
      const result = await db.query('SELECT status, COUNT(*)::int AS count FROM tasks GROUP BY status');
      const stats = { todo: 0, in_progress: 0, done: 0 };
      for (const row of result.rows) stats[row.status] = row.count;
      res.json({ ...stats, total: Object.values(stats).reduce((a, b) => a + b, 0) });
    } catch (error) { next(error); }
  });

  app.post('/api/tasks', async (req, res, next) => {
    const { title, description = '', priority = 'medium' } = req.body || {};
    if (typeof title !== 'string' || !title.trim() || title.length > 150 || typeof description !== 'string' || description.length > 2000 || !allowedPriorities.has(priority)) {
      return res.status(400).json({ error: 'Invalid task title, description, or priority' });
    }
    try {
      const result = await db.query('INSERT INTO tasks (title, description, priority) VALUES ($1, $2, $3) RETURNING *', [title.trim(), description, priority]);
      res.status(201).json(result.rows[0]);
    } catch (error) { next(error); }
  });

  app.patch('/api/tasks/:id', async (req, res, next) => {
    const { title, description, priority, status } = req.body || {};
    if (!/^\d+$/.test(req.params.id) || (title === undefined && description === undefined && priority === undefined && status === undefined) ||
        (title !== undefined && (typeof title !== 'string' || !title.trim() || title.length > 150)) ||
        (description !== undefined && (typeof description !== 'string' || description.length > 2000)) ||
        (priority !== undefined && !allowedPriorities.has(priority)) ||
        (status !== undefined && !allowedStatuses.has(status))) {
      return res.status(400).json({ error: 'Invalid task update' });
    }
    try {
      const result = await db.query(`UPDATE tasks SET title = COALESCE($1, title), description = COALESCE($2, description), priority = COALESCE($3, priority), status = COALESCE($4, status), updated_at = NOW() WHERE id = $5 RETURNING *`, [title?.trim() ?? null, description ?? null, priority ?? null, status ?? null, req.params.id]);
      if (!result.rowCount) return res.status(404).json({ error: 'Task not found' });
      res.json(result.rows[0]);
    } catch (error) { next(error); }
  });

  app.delete('/api/tasks/:id', async (req, res, next) => {
    if (!/^\d+$/.test(req.params.id)) return res.status(400).json({ error: 'Invalid task ID' });
    try {
      const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [req.params.id]);
      if (!result.rowCount) return res.status(404).json({ error: 'Task not found' });
      res.status(204).end();
    } catch (error) { next(error); }
  });

  app.use((error, _req, res, _next) => {
    console.error('Request failed:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  });
  return app;
}
