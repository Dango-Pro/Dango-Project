import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../libs/api";
import Layout from "../components/Layout";
import type { Post } from "../types/post";
import { useTranslation } from "react-i18next";

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export default function PostsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[]>([]);
  const [status, setStatus] = useState("Loading...");
  const [query, setQuery] = useState("");

  const [category, setCategory] = useState<string>("ALL");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadPosts();
  }, [page, category]);

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    setPage(0);
  };

  const loadPosts = async () => {
    try {
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      params.append("page", page.toString());
      params.append("size", "10");

      const res = await api.get<PageResponse<Post>>(`/posts?${params.toString()}`);

      let data: Post[] = [];
      let total = 0;

      if (res.data && Array.isArray(res.data['content'])) {
          data = res.data.content;
          total = res.data.totalPages;
      } else if (Array.isArray(res.data)) {
          data = res.data;
      }

      if (category !== "ALL") {
        data = data.filter((p) => p.category === category);
      }

      setPosts(data);
      setTotalPages(total);
      setStatus(data.length ? "" : "게시글이 없습니다.");
    } catch (err) {
      console.error(err);
      setStatus("게시글을 불러오지 못했습니다.");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadPosts();
  };

  return (
    <Layout pageTitle={t("menu.community")}>
      <section className="glass-card" style={{ backgroundColor: '#ffffff', padding: '20px' }}>

        {/* 상단 탭 */}
        <div style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '25px',
            borderBottom: '1px solid #eee',
            paddingBottom: '10px'
        }}>
            <TabButton label="전체" active={category === "ALL"} onClick={() => handleCategoryChange("ALL")} />
            <TabButton label="자유" active={category === "FREE"} onClick={() => handleCategoryChange("FREE")} />
            <TabButton label="질문" active={category === "QNA"} onClick={() => handleCategoryChange("QNA")} />
            <TabButton label="⚡ 스터디" active={category === "STUDY"} onClick={() => handleCategoryChange("STUDY")} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000' }}>{t("menu.community")}</h2>
          <Link to="/posts/create" className="primary-btn">
            New Post
          </Link>
        </div>

        {/* 검색창 */}
        <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
           <input
             className="text-input"
             style={{ width: "100%", padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
             placeholder="Search posts..."
             value={query}
             onChange={(e) => setQuery(e.target.value)}
           />
        </form>

        <p className="muted">{status}</p>

        <div className="card-grid" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {posts.map((p) => (
            <article key={p.id} className="item-tile" style={{
                backgroundColor: '#fff', padding: '15px', borderRadius: '10px', border: '1px solid #eee',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
            }} onClick={() => navigate(`/posts/${p.id}`)}>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                    {/* 배지 표시 */}
                    <div style={{ display: 'flex', gap: '5px' }}>
                        {p.isNotice ? (
                            <span style={{ backgroundColor: '#ef4444', color: 'white', fontSize: '0.75rem', padding: '3px 6px', borderRadius: '4px', fontWeight: 'bold' }}>공지</span>
                        ) : (
                            <span style={{
                                backgroundColor: p.category === 'STUDY' ? '#3b82f6' : (p.category === 'QNA' ? '#f59e0b' : '#6b7280'),
                                color: 'white', fontSize: '0.75rem', padding: '3px 6px', borderRadius: '4px', fontWeight: 'bold'
                            }}>
                                {p.category === 'STUDY' ? '스터디' : (p.category === 'QNA' ? '질문' : '자유')}
                            </span>
                        )}
                        {p.category === 'STUDY' && (
                            <span style={{
                                backgroundColor: p.recruitmentStatus === 'CLOSED' ? '#9ca3af' : '#10b981',
                                color: 'white', fontSize: '0.75rem', padding: '3px 6px', borderRadius: '4px', fontWeight: 'bold'
                            }}>
                                {p.recruitmentStatus === 'CLOSED' ? '마감' : '모집중'}
                            </span>
                        )}
                    </div>
                </div>

                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#000' }}>
                    {p.title}
                </h3>

                <div style={{ fontSize: "0.9rem", color: "#666", display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <span>By {p.authorName || "익명"}</span>
                   <span>|</span>
                   <span>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '날짜 없음'}</span>
                   <span>|</span>
                   {/* ★ 여기는 이제 버튼이 아니라 그냥 텍스트입니다 */}
                   <span style={{ color: '#e11d48', fontWeight: 'bold' }}>❤️ {p.likeCount}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '10px' }}>
            <button
              onClick={(e) => { e.stopPropagation(); setPage(p => Math.max(0, p - 1)); }}
              disabled={page === 0}
              className="secondary-btn"
            >
              &lt; Prev
            </button>
            <span style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setPage(p => Math.min(totalPages - 1, p + 1)); }}
              disabled={page === totalPages - 1}
              className="secondary-btn"
            >
              Next &gt;
            </button>
          </div>
        )}
      </section>
    </Layout>
  );
}

const TabButton = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      background: 'none',
      border: 'none',
      color: active ? '#000000' : '#888888',
      fontWeight: active ? 'bold' : '500',
      cursor: 'pointer',
      fontSize: '1.05rem',
      padding: '8px 10px',
      borderBottom: active ? '3px solid #000000' : '3px solid transparent',
      transition: 'all 0.2s ease',
    }}
  >
    {label}
  </button>
);