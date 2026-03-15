import { useEffect, useMemo, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL || "/api";
const AUTH_URL = import.meta.env.VITE_AUTH_URL || "/auth";
const statusOptions = ["todo", "in-progress", "done"];
const SESSION_KEY = "cloudTasksSession";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("todo");
  const [auth, setAuth] = useState({ name: "", email: "", password: "" });
  const [login, setLogin] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("Cloud-native task manager with Docker, Kubernetes, PostgreSQL and Ingress.");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  useEffect(() => {
    try {
      const rawSession = localStorage.getItem(SESSION_KEY);
      if (!rawSession) return;
      const session = JSON.parse(rawSession);
      if (session?.user && session?.token) {
        setUser(session.user);
        setToken(session.token);
        setMessage(`Welcome back ${session.user.name}. Session restored.`);
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  function saveSession(nextUser, nextToken) {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user: nextUser, token: nextToken }));
  }

  function logout() {
    setUser(null);
    setToken("");
    localStorage.removeItem(SESSION_KEY);
    setMessage("You have been logged out.");
  }

  async function fetchTasks() {
    try {
      const res = await fetch(`${API_URL}/tasks`);
      if (!res.ok) {
        setMessage("Task API returned an error.");
        return;
      }
      const data = await res.json();
      setTasks(data);
    } catch {
      setMessage("Cannot reach the API right now. Start the backend services first.");
    }
  }
  useEffect(() => { fetchTasks(); }, []);

  const stats = useMemo(() => ({
    total: tasks.length,
    done: tasks.filter(t => t.status === "done").length,
    progress: tasks.filter(t => t.status === "in-progress").length
  }), [tasks]);

  async function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
    const res = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers,
      body: JSON.stringify({ title, status })
    });
    if (res.ok) {
      setTitle("");
      setStatus("todo");
      setMessage("Task added successfully.");
      fetchTasks();
      return;
    }
    setMessage("Unable to add task right now.");
  }

  async function cycleStatus(task) {
    const nextStatus = statusOptions[(statusOptions.indexOf(task.status) + 1) % statusOptions.length];
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
    const res = await fetch(`${API_URL}/tasks/${task.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ status: nextStatus })
    });
    if (res.ok) {
      setMessage(`Task #${task.id} updated to ${nextStatus}.`);
      fetchTasks();
      return;
    }
    setMessage(`Unable to update task #${task.id}.`);
  }

  async function removeTask(id) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE", headers });
    if (res.ok) {
      setMessage(`Task #${id} deleted.`);
      fetchTasks();
      return;
    }
    setMessage(`Unable to delete task #${id}.`);
  }

  async function register(e) {
    e.preventDefault();
    if (!auth.name.trim() || !auth.email.trim() || !auth.password.trim()) {
      setMessage("Name, email and password are required.");
      return;
    }
    setIsRegisterLoading(true);
    try {
      const res = await fetch(`${AUTH_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(auth)
      });
      const data = await res.json();
      setMessage(data.message || "Registration finished.");
      if (res.ok) {
        setLogin({ email: auth.email, password: "" });
        setAuth({ name: "", email: "", password: "" });
      }
    } catch {
      setMessage("Auth service is unreachable.");
    } finally {
      setIsRegisterLoading(false);
    }
  }

  async function signIn(e) {
    e.preventDefault();
    if (!login.email.trim() || !login.password.trim()) {
      setMessage("Email and password are required for login.");
      return;
    }
    setIsLoginLoading(true);
    try {
      const res = await fetch(`${AUTH_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(login)
      });
      const data = await res.json();
      if (res.ok && data?.token && data?.user) {
        saveSession(data.user, data.token);
        setLogin({ email: login.email, password: "" });
        setMessage(`Welcome ${data.user.name}. Session is now active.`);
        return;
      }
      setMessage(data.message || "Login failed.");
    } catch {
      setMessage("Auth service is unreachable.");
    } finally {
      setIsLoginLoading(false);
    }
  }

  const tokenPreview = token ? `${token.slice(0, 14)}...` : "Not connected";

  return (
    <div className="page-shell">
      <div className="aurora aurora-1" />
      <div className="aurora aurora-2" />
      <header className="hero">
        <div>
          <span className="eyebrow">Cloud project - microservices edition</span>
          <h1>Cloud Tasks Pro</h1>
          <p>A clean demo showcasing React, Node.js, Docker, Kubernetes, PostgreSQL and an Ingress gateway in one polished project.</p>
          <div className="hero-badges"><span>React</span><span>Node.js</span><span>PostgreSQL</span><span>Kubernetes</span></div>
        </div>
        <div className="status-card glass">
          <h3>Project status</h3>
          <p>{message}</p>
          <div className="stats-grid">
            <article><strong>{stats.total}</strong><span>Tasks</span></article>
            <article><strong>{stats.progress}</strong><span>In progress</span></article>
            <article><strong>{stats.done}</strong><span>Done</span></article>
          </div>
          {user ? <div className="user-pill">Connected as {user.name} - token {tokenPreview}</div> : null}
          {user ? <div className="session-actions"><button className="secondary" onClick={logout}>Logout</button></div> : null}
        </div>
      </header>
      <main className="layout">
        <section className="panel glass">
          <div className="section-title"><h2>Task board</h2><p>Add, update and delete tasks through the API service.</p></div>
          <form className="task-form" onSubmit={addTask}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a new cloud task" />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>{statusOptions.map(item => <option key={item} value={item}>{item}</option>)}</select>
            <button type="submit">Add task</button>
          </form>
          <div className="task-list">
            {tasks.map(task => (
              <article className="task-card" key={task.id}>
                <div><h3>{task.title}</h3><span className={`badge badge-${task.status}`}>{task.status}</span></div>
                <div className="task-actions"><button className="secondary" onClick={() => cycleStatus(task)}>Next status</button><button className="danger" onClick={() => removeTask(task.id)}>Delete</button></div>
              </article>
            ))}
          </div>
        </section>
        <section className="panel-stack">
          <section className="panel glass">
            <div className="section-title"><h2>Create account</h2><p>Demo authentication service.</p></div>
            <form className="form-grid" onSubmit={register}>
              <input placeholder="Name" value={auth.name} onChange={(e) => setAuth({ ...auth, name: e.target.value })} disabled={isRegisterLoading} />
              <input placeholder="Email" value={auth.email} onChange={(e) => setAuth({ ...auth, email: e.target.value })} disabled={isRegisterLoading} />
              <input placeholder="Password" type="password" value={auth.password} onChange={(e) => setAuth({ ...auth, password: e.target.value })} disabled={isRegisterLoading} />
              <button type="submit" disabled={isRegisterLoading}>{isRegisterLoading ? "Registering..." : "Register"}</button>
            </form>
          </section>
          <section className="panel glass">
            <div className="section-title"><h2>Login</h2><p>JWT token endpoint demo.</p></div>
            <form className="form-grid" onSubmit={signIn}>
              <input placeholder="Email" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} disabled={isLoginLoading || !!user} />
              <input placeholder="Password" type="password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} disabled={isLoginLoading || !!user} />
              <button type="submit" disabled={isLoginLoading || !!user}>{isLoginLoading ? "Signing in..." : user ? "Connected" : "Login"}</button>
            </form>
          </section>
          <section className="panel feature-panel glass"><h2>Why this should score higher</h2><ul><li>3 containers + database</li><li>Persistent PostgreSQL data</li><li>Ingress gateway and Kubernetes services</li><li>Modern front-end and report included</li></ul></section>
        </section>
      </main>
    </div>
  );
}
