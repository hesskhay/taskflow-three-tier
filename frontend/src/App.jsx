import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || '/api';
const statusNames = { todo: 'To do', in_progress: 'In progress', done: 'Done' };

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function request(path, options) {
    const res = await fetch(`${API}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } });
    if (!res.ok) throw new Error(`API request failed (${res.status})`);
    return res.status === 204 ? null : res.json();
  }
  async function refresh() {
    try { setError(''); setTasks(await request('/tasks')); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);
  async function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await request('/tasks', { method: 'POST', body: JSON.stringify({ title, priority }) });
      setTitle(''); await refresh();
    } catch (e) { setError(e.message); }
  }
  async function updateTask(id, status) {
    try { await request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); await refresh(); }
    catch (e) { setError(e.message); }
  }
  async function removeTask(id) {
    try { await request(`/tasks/${id}`, { method: 'DELETE' }); await refresh(); }
    catch (e) { setError(e.message); }
  }
  const counts = Object.fromEntries(Object.keys(statusNames).map(k => [k, tasks.filter(t => t.status === k).length]));
  return <div className="layout">
    <aside><div className="brand">◆ TaskFlow</div><div className="nav">▦ &nbsp; Dashboard</div><div className="nav muted">◷ &nbsp; Activity</div><div className="aside-footer">Developer demo · v1.0</div></aside>
    <main><header><div><div className="eyebrow">WORKSPACE / OVERVIEW</div><h1>Team tasks</h1><p>Plan, track, and complete your team's work.</p></div><span className="avatar">TF</span></header>
    <section className="stats"><article><span>All tasks</span><strong>{tasks.length}</strong></article>{Object.entries(statusNames).map(([key, label]) => <article key={key}><span>{label}</span><strong>{counts[key]}</strong></article>)}</section>
    <section className="create"><h2>Create a task</h2><form onSubmit={addTask}><input aria-label="Task title" placeholder="What needs to be done?" value={title} onChange={e => setTitle(e.target.value)} maxLength={150} required /><select aria-label="Priority" value={priority} onChange={e => setPriority(e.target.value)}><option value="low">Low priority</option><option value="medium">Medium priority</option><option value="high">High priority</option></select><button>Add task +</button></form></section>
    {error && <p role="alert" className="error">{error}</p>}
    <section className="board">{Object.entries(statusNames).map(([key, label]) => <div className="column" key={key}><h2>{label} <small>{counts[key]}</small></h2>{loading ? <p>Loading…</p> : tasks.filter(t => t.status === key).map(task => <article className="task" key={task.id}><div className="task-top"><span className={`priority ${task.priority}`}>{task.priority}</span><button className="delete" aria-label={`Delete ${task.title}`} onClick={() => removeTask(task.id)}>×</button></div><h3>{task.title}</h3>{task.description && <p>{task.description}</p>}<select aria-label={`Status of ${task.title}`} value={task.status} onChange={e => updateTask(task.id, e.target.value)}>{Object.entries(statusNames).map(([value, name]) => <option key={value} value={value}>{name}</option>)}</select></article>)}{!loading && counts[key] === 0 && <div className="empty">No tasks here yet</div>}</div>)}</section>
    </main></div>;
}
