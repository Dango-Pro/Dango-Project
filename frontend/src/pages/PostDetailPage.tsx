// (이 파일은 로직이 복잡하므로 디자인에 집중하여 기존 코드에 스타일을 입힌 버전입니다)
import { useEffect, useState, useRef } from "react";
import DOMPurify from "dompurify";
import { api } from "../libs/api";
import Layout from "../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Post } from "../types/post";
import type { Comment } from "../types/comment";

const STUDY_TYPE_LABEL: Record<string, string> = { ONLINE: "온라인", OFFLINE: "오프라인", HYBRID: "온/오프라인 혼합" };

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [isApplied, setIsApplied] = useState(false);
  const [applyMsg, setApplyMsg] = useState("");
  const [contact, setContact] = useState("");
  const viewCountedRef = useRef<string | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    if (!id) return;
    api.get<Post>(`/posts/${id}`).then(res => {
        setPost(res.data);
        if (res.data.category === 'STUDY') fetchStudyData();
        if (viewCountedRef.current !== id) {
          viewCountedRef.current = id;
          api.post(`/posts/${id}/view`).catch(() => {});
        }
    }).catch(() => navigate('/posts'));
  }, [id]);

  useEffect(() => {
    if (id) fetchComments();
  }, [id]);

  const fetchStudyData = () => {
    if (!id) return;
    api.get(`/posts/${id}/applicants`).then(res => setApplicants(res.data)).catch(() => setApplicants([]));
    api.get(`/posts/${id}/applicants/me`).then(() => setIsApplied(true)).catch(() => setIsApplied(false));
  };

  const fetchComments = () => {
    if (!id) return;
    api.get<Comment[]>(`/posts/${id}/comments`).then(res => setComments(res.data)).catch(() => setComments([]));
  };

  const handleApply = () => {
    api.post(`/posts/${id}/apply`, { message: applyMsg, contactInfo: contact }).then(() => {
      setIsApplied(true);
      fetchStudyData();
    }).catch((e: any) => alert(e.response?.data?.message || "신청에 실패했습니다."));
  };

  const handleCancelApply = () => {
    if (!window.confirm("신청을 취소하시겠습니까?")) return;
    api.delete(`/posts/${id}/apply`).then(() => {
      setIsApplied(false);
      fetchStudyData();
    }).catch((e: any) => alert(e.response?.data?.message || "취소에 실패했습니다."));
  };

  const handleToggleRecruitment = () => {
    if (!post) return;
    const next = post.recruitmentStatus === "RECRUITING" ? "CLOSED" : "RECRUITING";
    api.patch(`/posts/${id}/recruitment`, { recruitmentStatus: next }).then(res => setPost(res.data)).catch((e: any) => alert(e.response?.data?.message || "상태 변경에 실패했습니다."));
  };

  const handleDelete = () => {
    if (!window.confirm("이 게시글을 삭제하시겠습니까?")) return;
    api.delete(`/posts/${id}`).then(() => navigate('/posts')).catch((e: any) => alert(e.response?.data?.message || "삭제에 실패했습니다."));
  };

  const handleLike = () => {
    api.post<Post>(`/posts/${id}/like`).then(res => setPost(res.data)).catch(() => {});
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    api.post(`/posts/${id}/comments`, { content: newComment }).then(() => { setNewComment(""); fetchComments(); }).catch(() => {});
  };

  const handleReply = (e: React.FormEvent, parentId: number) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    api.post(`/posts/${id}/comments?parentId=${parentId}`, { content: replyContent }).then(() => { setReplyContent(""); setReplyTo(null); fetchComments(); }).catch(() => {});
  };

  const isMyComment = (c: Comment) => !!user && (user.email === c.authorName || (user as any).username === c.authorName);

  const handleDeleteComment = (commentId: number) => {
    if (!window.confirm("이 댓글을 삭제하시겠습니까?")) return;
    api.delete(`/comments/${commentId}`).then(() => fetchComments()).catch((e: any) => alert(e.response?.data?.message || "삭제에 실패했습니다."));
  };

  const renderComments = (list: Comment[], depth = 0) => (
    list.map(c => (
      <div key={c.id} style={{ marginLeft: depth * 20, marginTop: 10 }}>
        <div style={{ background: "rgba(0,0,0,0.03)", padding: 12, borderRadius: 8, border: "1px solid #eee" }}>
          <div style={{ fontSize: "0.8rem", color: "#666", marginBottom: 4 }}>{c.authorName || "알 수 없음"}</div>
          <div style={{ whiteSpace: "pre-wrap" }}>{c.content}</div>
          <div style={{ marginTop: 6, display: "flex", gap: 8, alignItems: "center" }}>
            <button type="button" className="muted" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", textDecoration: "underline" }} onClick={() => { setReplyTo(replyTo === c.id ? null : c.id); setReplyContent(""); }}>답글</button>
            {isMyComment(c) && (
              <button type="button" className="muted" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", textDecoration: "underline", color: "#c00" }} onClick={() => handleDeleteComment(c.id)}>삭제</button>
            )}
          </div>
        </div>
        {replyTo === c.id && (
          <form onSubmit={(e) => handleReply(e, c.id)} style={{ marginTop: 8, display: "flex", gap: 8, marginLeft: 10 }}>
            <input className="text-input" style={{ flex: 1 }} placeholder="답글 입력..." value={replyContent} onChange={e => setReplyContent(e.target.value)} autoFocus />
            <button type="submit" className="secondary-btn">등록</button>
          </form>
        )}
        {c.replies && c.replies.length > 0 && renderComments(c.replies, depth + 1)}
      </div>
    ))
  );

  if (!post) return <Layout>Loading...</Layout>;

  const isAuthor = user?.id === post.authorId;

  return (
    <Layout pageTitle={post.title}>
      <section className="glass-card" style={{ padding: '40px' }}>
        {/* 헤더 영역 */}
        <div style={{ borderBottom: '1px solid #eee', paddingBottom: 20, marginBottom: 30 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <span className="pill">{post.category === 'STUDY' ? '⚡ 스터디' : (post.category === 'QNA' ? '❓ 질문' : '자유')}</span>
                {post.isNotice && <span className="pill" style={{ color: 'red', borderColor: 'red' }}>공지</span>}
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '10px 0' }}>{post.title}</h1>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                <span>{post.authorName} · {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}</span>
                <button type="button" onClick={handleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ec4899', fontWeight: 600 }}>♥ {post.likeCount}</button>
            </div>
        </div>

        {/* 본문 영역 */}
        <div className="post-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} style={{ minHeight: 200, marginBottom: 40 }} />

        {/* [디자인 핵심] 스터디 관리 섹션 */}
        {post.category === 'STUDY' && (
            <div style={{ backgroundColor: '#f8fafc', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 40 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>📢 스터디 모집 현황</h3>
                    <span className="pill" style={{ backgroundColor: post.recruitmentStatus === 'RECRUITING' ? '#dcfce7' : '#f3f4f6', color: post.recruitmentStatus === 'RECRUITING' ? '#166534' : '#4b5563' }}>
                        {post.recruitmentStatus === 'RECRUITING' ? '🟢 모집중' : '⚫ 모집완료'}
                    </span>
                </div>

                <div style={{ display: 'grid', gap: 10, color: '#475569', marginBottom: 20 }}>
                    <div><strong>진행 방식:</strong> {post.studyType ? (STUDY_TYPE_LABEL[post.studyType] || post.studyType) : "-"}</div>
                    {post.contactLink && <div><strong>연락처:</strong> <a href={post.contactLink} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>오픈채팅 바로가기</a></div>}
                </div>

                {isAuthor ? (
                    // 작성자 뷰
                    <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                            <strong>신청자 목록 ({applicants.length}명)</strong>
                            <button className="secondary-btn" onClick={handleToggleRecruitment}>
                                {post.recruitmentStatus === 'RECRUITING' ? '🚫 모집 마감하기' : '✅ 모집 재개하기'}
                            </button>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {applicants.map((app: any) => (
                                <li key={app.id} style={{ padding: '10px', background: 'white', borderRadius: 8, marginBottom: 8, border: '1px solid #e2e8f0' }}>
                                    <strong>{app.applicantName}</strong>: {app.message} <span className="muted">({app.contactInfo})</span>
                                </li>
                            ))}
                            {applicants.length === 0 && <p className="muted">아직 신청자가 없습니다.</p>}
                        </ul>
                    </div>
                ) : (
                    // 참여자 뷰
                    <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: 20 }}>
                        {post.recruitmentStatus === 'CLOSED' ? (
                            <p style={{ textAlign: 'center', color: '#94a3b8' }}>모집이 마감되었습니다.</p>
                        ) : isApplied ? (
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ color: '#166534', fontWeight: 'bold' }}>✅ 신청이 완료되었습니다.</p>
                                <button className="secondary-btn" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={handleCancelApply}>신청 취소</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                                <div style={{ flex: 1 }}>
                                    <input className="text-input" placeholder="한마디 (예: 열심히 하겠습니다!)" style={{ marginBottom: 8, width: '100%' }} value={applyMsg} onChange={e=>setApplyMsg(e.target.value)} />
                                    <input className="text-input" placeholder="연락처 (카톡ID 등)" style={{ width: '100%' }} value={contact} onChange={e=>setContact(e.target.value)} />
                                </div>
                                <button className="primary-btn" style={{ height: 'fit-content', padding: '12px 24px' }} onClick={handleApply}>신청하기</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}

        {/* 댓글 */}
        <div style={{ borderTop: '1px solid #eee', paddingTop: 24, marginBottom: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem' }}>댓글 ({comments.length})</h3>
            <div style={{ marginBottom: 16 }}>{renderComments(comments)}</div>
            {comments.length === 0 && <p className="muted" style={{ marginBottom: 16 }}>아직 댓글이 없습니다.</p>}
            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 10 }}>
                <input className="text-input" style={{ flex: 1 }} placeholder="댓글을 입력하세요..." value={newComment} onChange={e => setNewComment(e.target.value)} />
                <button type="submit" className="primary-btn">등록</button>
            </form>
        </div>

        {/* 목록/수정/삭제 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: 20 }}>
            <button className="secondary-btn" onClick={() => navigate('/posts')}>목록으로</button>
            {isAuthor && (
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="secondary-btn" onClick={() => navigate(`/posts/${id}/edit`)}>수정</button>
                    <button className="secondary-btn" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={handleDelete}>삭제</button>
                </div>
            )}
        </div>
      </section>
    </Layout>
  );
}