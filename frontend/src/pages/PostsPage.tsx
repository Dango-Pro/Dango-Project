import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../libs/api";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import type { Post, PostCategory } from "../types/post";

const PAGE_SIZE = 10;

const dateLocaleMap: Record<string, string> = { ko: "ko-KR", en: "en-US", ja: "ja-JP" };

export default function PostsPage() {
  const { t, i18n } = useTranslation();
  const dateLocale = dateLocaleMap[i18n.language] ?? "ko-KR";
  const [posts, setPosts] = useState<Post[]>([]);
  const [statusKey, setStatusKey] = useState<"loading" | "no_posts" | "load_fail" | "">("loading");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PostCategory | "">("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const CATEGORY_OPTIONS: { value: PostCategory | ""; labelKey: string }[] = [
    { value: "", labelKey: "posts.category_all" },
    { value: "FREE", labelKey: "posts.category_free" },
    { value: "QNA", labelKey: "posts.category_qna" },
    { value: "STUDY", labelKey: "posts.category_study" },
  ];

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
        setStatusKey(list.length ? "" : "no_posts");
      })
      .catch(() => setStatusKey("load_fail"));
  }, [query, category, page]);

  // 카테고리별 배지 스타일
  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "STUDY": return <span className="pill" style={{ backgroundColor: "#e0f2fe", color: "#0284c7", border: "none", fontSize: "0.75rem" }}>⚡ {t("posts.badge_study")}</span>;
      case "QNA": return <span className="pill" style={{ backgroundColor: "#fef3c7", color: "#d97706", border: "none", fontSize: "0.75rem" }}>❓ {t("posts.badge_qna")}</span>;
      default: return <span className="pill" style={{ backgroundColor: "#f3f4f6", color: "#4b5563", border: "none", fontSize: "0.75rem" }}>🗣 {t("posts.badge_free")}</span>;
    }
  };

  const statusMessage = statusKey === "loading" ? t("posts.loading") : statusKey === "no_posts" ? t("posts.no_posts") : statusKey === "load_fail" ? t("posts.load_fail") : "";

  return (
    <Layout pageTitle={t("posts.board_title")}>
      <section className="glass-card">
        <div className="card-header">
          <h2 className="card-title">{t("posts.board_title")}</h2>
          <Link to="/posts/create" className="primary-btn">
            + {t("posts.write_new")}
          </Link>
        </div>

        <div style={{ marginBottom: 16 }}>
           <input
             className="text-input"
             style={{ width: "100%" }}
             placeholder={t("posts.search_placeholder")}
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
              {t(opt.labelKey)}
            </button>
          ))}
        </div>

        {posts.length === 0 ? (
          <p className="muted" style={{ textAlign: 'center', padding: '40px 0' }}>{statusMessage}</p>
        ) : (
          <div style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee', background: 'rgba(0,0,0,0.02)' }}>
                  <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap', width: 52 }}>{t("posts.col_no")}</th>
                  <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600, width: 60 }}></th>
                  <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600, width: '50%' }}>{t("posts.col_title")}</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap', width: 90 }}>{t("posts.col_author")}</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap', width: 95 }}>{t("posts.col_date")}</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap', width: 65 }}>{t("posts.col_views")}</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap', width: 65 }}>{t("posts.col_likes")}</th>
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
                        <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, background: '#f97316', color: '#fff' }}>{t("posts.notice_tag")}</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <Link to={`/posts/${p.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.title}>
                        {getCategoryBadge(p.category)}
                        {p.category === 'STUDY' && p.recruitmentStatus && (
                          <span style={{ marginLeft: 6, fontSize: '0.75rem', fontWeight: 600, color: p.recruitmentStatus === 'RECRUITING' ? '#10b981' : '#6b7280' }}>
                            {p.recruitmentStatus === 'RECRUITING' ? t("posts.recruiting") : t("posts.closed")}
                          </span>
                        )}
                        <span style={{ marginLeft: 6 }}>{p.title}</span>
                      </Link>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center', color: '#555', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.authorName ?? ''}>{p.authorName ?? '-'}</td>
                    <td style={{ padding: '12px 10px', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
                      {p.createdAt ? (() => { try { const d = new Date(p.createdAt); return isNaN(d.getTime()) ? "-" : d.toLocaleDateString(dateLocale, { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\. /g, "."); } catch { return "-"; } })() : "-"}
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
            <button type="button" className="secondary-btn" style={{ padding: '6px 12px' }} disabled={page <= 0} onClick={() => setPage(p => Math.max(0, p - 1))}>{t("posts.prev")}</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pNum = page < 3 ? i : (page - 2 + i);
              if (pNum < 0 || pNum >= totalPages) return null;
              return (
                <button key={pNum} type="button" className={pNum === page ? "primary-btn" : "secondary-btn"} style={{ padding: '6px 12px', minWidth: 36 }} onClick={() => setPage(pNum)}>{pNum + 1}</button>
              );
            })}
            <button type="button" className="secondary-btn" style={{ padding: '6px 12px' }} disabled={page >= totalPages - 1} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}>{t("posts.next")}</button>
          </div>
        )}
      </section>
    </Layout>
  );
}