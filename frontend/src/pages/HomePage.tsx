import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../libs/api";
import type { Post } from "../types/post";

const Carousel = () => {
    const [current, setCurrent] = useState(0);
    const slides = [
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200&q=80"
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <div style={{ position: "relative", height: "100%", minHeight: "300px", borderRadius: "24px", overflow: "hidden", background: "#000" }}>
            {slides.map((src, idx) => (
                <div
                    key={idx}
                    style={{
                        position: "absolute", inset: 0,
                        opacity: idx === current ? 1 : 0, transition: "opacity 0.8s ease-in-out",
                    }}
                >
                    <img src={src} alt={`Slide ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", bottom: 20, left: 20, background: "rgba(0,0,0,0.5)", padding: "10px 20px", borderRadius: "8px" }}>
                         <h2 style={{ fontSize: "1.5rem", color: "#fff", margin: 0 }}>Event {idx + 1}</h2>
                    </div>
                </div>
            ))}
            <div style={{ position: "absolute", bottom: "16px", left: "0", right: "0", display: "flex", justifyContent: "center", gap: "8px" }}>
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        style={{
                            width: "8px", height: "8px", borderRadius: "50%",
                            background: idx === current ? "#fff" : "rgba(255,255,255,0.3)",
                            border: "none", cursor: "pointer", padding: 0,
                            transition: "background 0.3s"
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

const NoticeWidget = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<Post[]>("/posts?notice=true").then(res => {
            setPosts(res.data.slice(0, 5));
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    return (
        <div className="glass-card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <h3 className="card-title" style={{ fontSize: "1.2rem", marginBottom: "16px" }}>Notices</h3>
            <div style={{ flex: 1 }}>
                {loading ? <p className="muted">Loading...</p> : (
                    <ul style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {posts.length === 0 && <li className="muted">No notices found.</li>}
                        {posts.map(p => (
                            <li key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Link to={`/posts/${p.id}`} style={{ textDecoration: "none", color: "#e0e0e0", fontSize: "0.95rem", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginRight: "10px" }}>
                                    <span style={{ color: "#ff6b6b", marginRight: "6px", fontWeight: "bold" }}>[Notice]</span>
                                    {p.title}
                                </Link>
                                <span className="muted" style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                                    New
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div style={{ marginTop: "16px", textAlign: "right" }}>
                <Link to="/posts" className="muted" style={{ fontSize: "0.85rem", textDecoration: "underline" }}>View All</Link>
            </div>
        </div>
    );
};

const LoginWidget = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        if (!username || !password) return;
        try {
            const res = await api.post("/auth/login", { username, password });
            localStorage.setItem("token", res.data.accessToken);
            if (res.data.refreshToken) localStorage.setItem("refreshToken", res.data.refreshToken);
            window.location.reload();
        } catch (err) {
            console.error(err);
            setError("Login failed.");
        }
    };

    if (token) {
        return (
             <div className="glass-card" style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
                 <h3 className="card-title" style={{ marginBottom: "10px" }}>Welcome Back!</h3>
                 <p className="muted" style={{ marginBottom: "20px" }}>You are logged in.</p>
                 <div style={{ display: "flex", gap: "10px" }}>
                     <Link to="/dashboard" className="primary-btn">Dashboard</Link>
                     <button className="secondary-btn" onClick={() => {
                         if(window.confirm("Logout?")) {
                             localStorage.removeItem("token");
                             localStorage.removeItem("refreshToken");
                             window.location.reload();
                         }
                     }}>Logout</button>
                 </div>
             </div>
        );
    }

    return (
        <div className="glass-card" style={{ height: "100%" }}>
            <h3 className="card-title" style={{ fontSize: "1.2rem", marginBottom: "16px" }}>Quick Login</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input
                    className="text-input"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
                <input
                    className="text-input"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
                <button className="primary-btn" onClick={handleLogin}>Login</button>
                {error && <p style={{ color: "#ff6b6b", fontSize: "0.85rem", margin: 0 }}>{error}</p>}
                <div style={{ textAlign: "center", fontSize: "0.85rem" }}>
                    <Link to="/register" className="muted" style={{ textDecoration: "underline" }}>Create Account</Link>
                </div>
            </div>
        </div>
    );
};

export default function HomePage() {
  const shortcuts = [
    { label: "Decks", to: "/decks" },
    { label: "Study", to: "/study" },
    { label: "Community", to: "/posts" },
  ];

  return (
    <Layout>
      {/* Top Section: Carousel (3) + Login (1) */}
      <div style={{
          display: "grid",
          gridTemplateColumns: "3fr 1fr",
          gap: "20px",
          marginBottom: "20px",
          height: "350px" // Fixed height for alignment
      }}>
          <Carousel />
          <LoginWidget />
      </div>

      {/* Middle Section: Notices */}
      <div style={{ marginBottom: "30px" }}>
           <NoticeWidget />
      </div>

      <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px" }}>
           {shortcuts.map(s => (
               <Link key={s.to} to={s.to} className="secondary-btn" style={{ padding: "10px 24px", minWidth: "120px", textAlign: "center" }}>
                   {s.label}
               </Link>
           ))}
      </div>
    </Layout>
  );
}
