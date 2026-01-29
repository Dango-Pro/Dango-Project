import { useEffect, useState } from "react";
import { api } from "../libs/api";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";

interface DashboardStats {
  totalCards: number;
  memorizedCards: number;
  totalDecks: number;
  totalPosts: number;
  totalLikes: number;
  dueCards: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DashboardStats>("/stats/dashboard")
       .then(res => setStats(res.data))
       .catch(console.error)
       .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout pageTitle="Dashboard"><p className="muted">Loading stats...</p></Layout>;
  if (!stats) return <Layout pageTitle="Dashboard"><p>Could not load statistics.</p></Layout>;

  const memorizedPercent = stats.totalCards > 0 ? Math.round((stats.memorizedCards / stats.totalCards) * 100) : 0;

  return (
    <Layout pageTitle="Dashboard">
      <div className="glass-card" style={{ marginBottom: 20 }}>
         <h2 className="card-title">Progress Overview</h2>

         <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
               <span>Memorized (Mastered)</span>
               <span>{memorizedPercent}% ({stats.memorizedCards}/{stats.totalCards})</span>
            </div>
            <div style={{ width: '100%', height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 5, overflow: 'hidden' }}>
               <div style={{ width: `${memorizedPercent}%`, height: '100%', background: 'white', transition: 'width 0.5s ease' }} />
            </div>
         </div>
      </div>

      <div className="card-grid">
         <div className="item-tile" style={{ textAlign: 'center', background: 'rgba(24, 144, 255, 0.15)', borderColor: 'rgba(24, 144, 255, 0.3)' }}>
            <h3 className="item-title" style={{ fontSize: '2rem', color: '#40a9ff' }}>{stats.dueCards}</h3>
            <p className="item-subtitle" style={{ color: '#bae7ff' }}>Cards Due Today</p>
            <Link to="/study" style={{ marginTop: 10, display: 'inline-block', fontSize: '0.8rem', textDecoration: 'underline', color: 'inherit' }}>Start Review</Link>
         </div>
         <div className="item-tile" style={{ textAlign: 'center' }}>
            <h3 className="item-title" style={{ fontSize: '2rem' }}>{stats.totalDecks}</h3>
            <p className="item-subtitle">Decks Created</p>
            <Link to="/decks" style={{ marginTop: 10, display: 'inline-block', fontSize: '0.8rem', textDecoration: 'underline', color: 'inherit' }}>Manage Decks</Link>
         </div>
         <div className="item-tile" style={{ textAlign: 'center' }}>
            <h3 className="item-title" style={{ fontSize: '2rem' }}>{stats.totalCards}</h3>
            <p className="item-subtitle">Total Cards</p>
            <Link to="/cards" style={{ marginTop: 10, display: 'inline-block', fontSize: '0.8rem', textDecoration: 'underline', color: 'inherit' }}>Browse All</Link>
         </div>
         <div className="item-tile" style={{ textAlign: 'center' }}>
            <h3 className="item-title" style={{ fontSize: '2rem' }}>{stats.totalPosts}</h3>
            <p className="item-subtitle">Posts Shared</p>
            <Link to="/posts" style={{ marginTop: 10, display: 'inline-block', fontSize: '0.8rem', textDecoration: 'underline', color: 'inherit' }}>View Community</Link>
         </div>
         <div className="item-tile" style={{ textAlign: 'center' }}>
            <h3 className="item-title" style={{ fontSize: '2rem' }}>{stats.totalLikes}</h3>
            <p className="item-subtitle">Community Likes</p>
         </div>
      </div>
    </Layout>
  );
}
