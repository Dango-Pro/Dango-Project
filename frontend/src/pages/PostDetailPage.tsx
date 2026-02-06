import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../libs/api";
import Layout from "../components/Layout";
import type { Post } from "../types/post";
import type { Comment } from "../types/comment";

interface UserInfo { id: number; username: string; }

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);

  // 스터디 관련 상태
  const [isApplied, setIsApplied] = useState(false);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [showApplicants, setShowApplicants] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  // 댓글 관련 상태
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState("");

  useEffect(() => {
    loadAllData();
  }, [id]);

  const loadAllData = async () => {
    try {
      // 1. 게시글 정보
      const postRes = await api.get<Post>(`/posts/${id}`);
      setPost(postRes.data);

      // 2. 댓글 목록
      loadComments();

      // 3. 내 정보 (작성자 확인용)
      try {
        const userRes = await api.get<UserInfo>("/user/me");
        setCurrentUser(userRes.data);

        // 4. 스터디 신청 여부 확인
        if (postRes.data.category === 'STUDY') {
           api.get<boolean>(`/posts/${id}/applied`).then(r => setIsApplied(r.data)).catch(()=>{});
        }
      } catch (e) {
        console.log("비로그인 사용자");
      }
    } catch (err) {
      alert("글을 불러올 수 없습니다.");
      navigate("/posts");
    }
  };

  const loadComments = () => {
    api.get<Comment[]>(`/posts/${id}/comments`)
       .then(res => setComments(res.data))
       .catch(err => console.error("댓글 로딩 실패", err));
  };

  // 좋아요
  const handleLike = async () => {
    try {
      const res = await api.post(`/posts/${id}/like`);
      setPost(prev => prev ? { ...prev, likeCount: res.data.likeCount } : null);
    } catch (err) {
      alert("로그인이 필요합니다.");
    }
  };

  // 게시글 삭제
  const handleDelete = async () => {
    if (!confirm("정말로 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/posts/${id}`);
      navigate("/posts");
    } catch (err) {
      alert("삭제 권한이 없습니다.");
    }
  };

  // --- 스터디 관리 (작성자용) ---
  const toggleRecruitment = async () => {
    if (!post) return;
    const newStatus = post.recruitmentStatus === 'RECRUITING' ? 'CLOSED' : 'RECRUITING';
    await api.patch(`/posts/${id}/status`, { status: newStatus });
    setPost({ ...post, recruitmentStatus: newStatus });
    alert("상태가 변경되었습니다.");
  };

  const loadApplicants = async () => {
    if (showApplicants) { setShowApplicants(false); return; }
    try {
      const res = await api.get(`/posts/${id}/applications`);
      setApplicants(res.data);
      setShowApplicants(true);
    } catch (err) { alert("신청자 목록을 불러올 수 없습니다."); }
  };

  // --- 스터디 신청 (참여자용) ---
  const handleApply = async () => {
    if(!applyMessage || !contactInfo) return alert("내용을 입력해주세요.");
    await api.post(`/posts/${id}/apply`, { message: applyMessage, contactInfo });
    setIsApplied(true);
    alert("신청되었습니다.");
  };

  const handleCancelApply = async () => {
    if(!confirm("취소하시겠습니까?")) return;
    await api.delete(`/posts/${id}/apply`);
    setIsApplied(false);
    alert("취소되었습니다.");
  };

  // --- 댓글 작성/삭제 ---
  const handleCommentSubmit = async () => {
    if (!commentContent.trim()) return;
    try {
      await api.post(`/posts/${id}/comments`, { content: commentContent });
      setCommentContent("");
      loadComments();
    } catch (err) { alert("댓글 작성 실패"); }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/comments/${commentId}`);
      loadComments();
    } catch (err) { alert("삭제 권한이 없습니다."); }
  };

  if (!post) return <Layout><p>Loading...</p></Layout>;

  // ★ 작성자 판별 (안전장치 포함)
  const isAuthor = currentUser && (
      (post.authorId && currentUser.id === post.authorId) ||
      (!post.authorId && post.authorName === currentUser.username)
  );

  return (
    <Layout pageTitle="게시글 상세">
      <section className="glass-card" style={{ backgroundColor: '#ffffff', padding: '30px' }}>

        {/* 헤더 영역 */}
        <div style={{ borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
             {post.isNotice && <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>공지</span>}
             <span style={{ backgroundColor: post.category === 'STUDY' ? '#3b82f6' : '#6b7280', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {post.category === 'STUDY' ? '스터디' : (post.category === 'QNA' ? '질문' : '자유')}
             </span>
             {post.category === 'STUDY' && (
                 <span style={{ backgroundColor: post.recruitmentStatus === 'CLOSED' ? '#9ca3af' : '#10b981', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {post.recruitmentStatus === 'CLOSED' ? '모집완료' : '모집중'}
                 </span>
             )}
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#000', margin: '0 0 15px 0' }}>{post.title}</h1>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#555', fontSize: '0.95rem' }}>
            <div>
              <span style={{ fontWeight: 'bold', color: '#333' }}>{post.authorName || "익명"}</span>
              <span style={{ margin: '0 10px' }}>|</span>
              <span>{post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}</span>
            </div>

            {/* ★ 좋아요 숫자 옆에 버튼 배치 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 'bold', color: '#e11d48', fontSize: '1.1rem' }}>❤️ {post.likeCount}</span>
                <button
                  onClick={handleLike}
                  className="secondary-btn"
                  style={{ padding: '6px 12px', fontSize: '0.85rem', color: '#e11d48', borderColor: '#e11d48' }}
                >
                  좋아요
                </button>
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="post-content" style={{ minHeight: '150px', lineHeight: '1.8', whiteSpace: 'pre-wrap', color: '#333' }}>
            {post.content}
        </div>

        {/* ========================================================= */}
        {/* ★ 스터디 기능 영역 (작성자는 관리 / 참여자는 신청) */}
        {/* ========================================================= */}
        {post.category === 'STUDY' && (
            <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #ddd', paddingBottom: '10px', color: '#333' }}>⚡ 스터디 모집 관리</h3>

                {isAuthor ? (
                    // 1. 작성자: 모집 관리 + 신청자 목록
                    <div>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            <button onClick={toggleRecruitment} className="primary-btn" style={{ backgroundColor: post.recruitmentStatus === 'RECRUITING' ? '#ef4444' : '#10b981' }}>
                                {post.recruitmentStatus === 'RECRUITING' ? '🚫 모집 마감하기' : '✅ 모집 재개하기'}
                            </button>
                            <button onClick={loadApplicants} className="secondary-btn">
                                {showApplicants ? '목록 닫기' : '📋 신청자 목록 보기'}
                            </button>
                        </div>
                        {showApplicants && (
                            <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '10px', border: '1px solid #eee' }}>
                                <h4 style={{marginTop: 0}}>신청자 목록</h4>
                                {applicants.length === 0 ? <p style={{color: '#666'}}>아직 신청자가 없습니다.</p> : (
                                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                        {applicants.map((app: any, idx) => (
                                            <li key={idx} style={{ marginBottom: '10px', color: '#333' }}>
                                                <strong>{app.applicantName}</strong>: {app.message} <br/>
                                                <span style={{ fontSize: '0.9rem', color: '#666' }}>연락처: {app.contactInfo}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    // 2. 참여자: 신청하기
                    <div>
                        {post.recruitmentStatus === 'CLOSED' ? (
                            <p style={{ color: '#ef4444', fontWeight: 'bold' }}>⚠️ 모집이 마감되었습니다.</p>
                        ) : isApplied ? (
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ color: '#10b981', fontWeight: 'bold' }}>✅ 이미 신청했습니다.</p>
                                <button onClick={handleCancelApply} className="secondary-btn" style={{ marginTop: '5px', borderColor: '#ef4444', color: '#ef4444' }}>신청 취소</button>
                            </div>
                        ) : (
                            <div style={{ maxWidth: '500px' }}>
                                <input placeholder="각오 한마디" className="text-input" style={{ width: '100%', marginBottom: '8px' }} value={applyMessage} onChange={e=>setApplyMessage(e.target.value)} />
                                <input placeholder="연락처 (오픈채팅 등)" className="text-input" style={{ width: '100%', marginBottom: '8px' }} value={contactInfo} onChange={e=>setContactInfo(e.target.value)} />
                                <button onClick={handleApply} className="primary-btn" style={{ width: '100%' }}>📝 신청하기</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}

        {/* --- ★ 댓글 영역 (복구됨) --- */}
        <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>💬 댓글 ({comments.length})</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                {comments.length === 0 ? <p className="muted">첫 번째 댓글을 남겨보세요!</p> : comments.map(c => (
                    <div key={c.id} style={{ padding: '15px', backgroundColor: '#f9fafb', borderRadius: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ fontWeight: 'bold' }}>{c.authorName || '익명'}</span>
                            {/* 댓글 삭제 버튼 (작성자 본인만) */}
                            {currentUser && (c.authorName === currentUser.username) && (
                                <button onClick={() => handleDeleteComment(c.id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>삭제</button>
                            )}
                        </div>
                        <p style={{ margin: 0, color: '#333' }}>{c.content}</p>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <input
                    className="text-input"
                    style={{ flex: 1 }}
                    placeholder="댓글을 입력하세요..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
                />
                <button onClick={handleCommentSubmit} className="secondary-btn">등록</button>
            </div>
        </div>

        {/* 하단 네비게이션 */}
        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
           <button onClick={() => navigate("/posts")} className="secondary-btn">목록으로</button>
           {isAuthor && (
               <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => navigate(`/posts/${id}/edit`)} className="secondary-btn">수정</button>
                  <button onClick={handleDelete} className="secondary-btn" style={{ borderColor: '#ef4444', color: '#ef4444' }}>삭제</button>
               </div>
           )}
        </div>
      </section>
    </Layout>
  );
}