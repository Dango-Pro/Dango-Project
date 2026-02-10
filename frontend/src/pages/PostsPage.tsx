import { useEffect, useState } from "react";
import { api } from "../libs/api";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import type { Post, PostCategory } from "../types/post";

const PAGE_SIZE = 10;

const CATEGORY_OPTIONS: { value: PostCategory | ""; label: string }[] = [
  { value: "", label: "전체" },
  { value: "FREE", label: "자유" },
  { value: "QNA", label: "질문" },
  { value: "STUDY", label: "스터디 모집" },
];

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [status, setStatus] = useState("Loading...");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PostCategory | "">("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (category) params.append("category", category);
    params.append("page", String(page));
    params.append("size", String(PAGE_SIZE));

    api
      .get<{ content: Post[]; totalPages: number; totalElements: number; number: number } | Post[]>(`/posts?${params.toString()}`)
      .then((res) => {
        const data = res.data as any;
        const list = Array.isArray(data) ? data : (data?.content ?? []);
        setPosts(list);
        const total = data?.totalElements ?? list.length;
        const pages = data?.totalPages ?? (list.length > 0 ? 1 : 0);
        setTotalPages(pages);
        setTotalElements(total);
        setStatus(list.length ? "" : "게시글이 없습니다.");
      })
      .catch(() => setStatus("게시글을 불러오지 못했습니다."));
  }, [query, category, page]);

  // 카테고리별 배지 스타일
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "STUDY": return <span className="pill" style={{ backgroundColor: "#e0f2fe", color: "#0284c7", border: "none", fontSize: "0.75rem" }}>⚡ 스터디</span>;
      case "QNA": return <span className="pill" style={{ backgroundColor: "#fef3c7", color: "#d97706", border: "none", fontSize: "0.75rem" }}>❓ 질문</span>;
      default: return <span className="pill" style={{ backgroundColor: "#f3f4f6", color: "#4b5563", border: "none", fontSize: "0.75rem" }}>🗣 자유</span>;
    }
  };

  return (
    <Layout pageTitle="게시판">
      <section className="glass-card">
        <div className="card-header">
          <h2 className="card-title">게시판</h2>
          <Link to="/posts/create" className="primary-btn">
            + 새 글 작성
          </Link>
        </div>

        <div style={{ marginBottom: 16 }}>
           <input
             className="text-input"
             style={{ width: "100%" }}
             placeholder="검색어를 입력하세요..."
             value={query}
             onChange={(e) => setQuery(e.target.value)}
           />
        </div>

        <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.value || "all"}
              type="button"
              className={category === opt.value ? "primary-btn" : "secondary-btn"}
              style={{ padding: "8px 14px", fontSize: "0.9rem" }}
              onClick={() => { setCategory(opt.value); setPage(0); }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {posts.length === 0 ? (
          <p className="muted" style={{ textAlign: 'center', padding: '40px 0' }}>{status}</p>
        ) : (
          <div style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee', background: 'rgba(0,0,0,0.02)' }}>
                  <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap', width: 52 }}>번호</th>
                  <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600, width: 60 }}></th>
                  <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600, width: '50%' }}>제목</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap', width: 90 }}>작성자</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap', width: 95 }}>작성일</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap', width: 65 }}>조회수</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap', width: 65 }}>좋아요</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p, index) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 10px', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
                      {page * PAGE_SIZE + index + 1}
                    </td>
                    <td style={{ padding: '12px 10px', verticalAlign: 'middle' }}>
                      {p.isNotice && (
                        <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, background: '#f97316', color: '#fff' }}>공지</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Link to={`/posts/${p.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.title}>
                        {getCategoryBadge(p.category)}
                        {p.category === 'STUDY' && p.recruitmentStatus && (
                          <span style={{ marginLeft: 6, fontSize: '0.75rem', fontWeight: 600, color: p.recruitmentStatus === 'RECRUITING' ? '#10b981' : '#6b7280' }}>
                            {p.recruitmentStatus === 'RECRUITING' ? '모집중' : '모집완료'}
                          </span>
                        )}
                        <span style={{ marginLeft: 6 }}>{p.title}</span>
                      </Link>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center', color: '#555' }}>{p.authorName ?? '-'}</td>
                    <td style={{ padding: '12px 10px', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
                      {p.createdAt ? (() => { try { const d = new Date(p.createdAt); return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.'); } catch { return '-'; } })() : '-'}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center', color: '#666' }}>{p.viewCount ?? 0}</td>
                    <td style={{ padding: '12px 10px', textAlign: 'center', color: '#ec4899', fontWeight: 600 }}>{p.likeCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
            <button type="button" className="secondary-btn" style={{ padding: '6px 12px' }} disabled={page <= 0} onClick={() => setPage(p => Math.max(0, p - 1))}>이전</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pNum = page < 3 ? i : (page - 2 + i);
              if (pNum < 0 || pNum >= totalPages) return null;
              return (
                <button key={pNum} type="button" className={pNum === page ? "primary-btn" : "secondary-btn"} style={{ padding: '6px 12px', minWidth: 36 }} onClick={() => setPage(pNum)}>{pNum + 1}</button>
              );
            })}
            <button type="button" className="secondary-btn" style={{ padding: '6px 12px' }} disabled={page >= totalPages - 1} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}>다음</button>
          </div>
        )}
      </section>
    </Layout>
  );
}