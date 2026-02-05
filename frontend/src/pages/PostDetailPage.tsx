import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../libs/api";
import Layout from "../components/Layout";
import type { Post, StudyApplication } from "../types/post";

export default function PostDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const postId = Number(id);

  const [post, setPost] = useState<Post | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // 스터디 신청 관련 상태
  const [hasApplied, setHasApplied] = useState(false);
  const [applicants, setApplicants] = useState<StudyApplication[]>([]);

  // 신청 폼 상태
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [applyContact, setApplyContact] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.get<{ id: number }>("/users/me")
        .then((res) => setCurrentUserId(res.data.id))
        .catch(() => setCurrentUserId(null));
    }
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      const res = await api.get<Post>(`/posts/${postId}`);
      setPost(res.data);

      // 스터디 모집글인 경우 추가 정보 로드
      if (res.data.category === "STUDY") {
        checkAppliedStatus();
      }
    } catch (err) {
      console.error(err);
      alert("게시글을 불러올 수 없습니다.");
      navigate("/posts");
    }
  };

  // 작성자일 때만 신청자 목록 로딩
  useEffect(() => {
    if (post && post.category === "STUDY" && currentUserId === post.authorId) {
      api.get<StudyApplication[]>(`/posts/${postId}/applications`)
        .then(res => setApplicants(res.data))
        .catch(err => console.log("신청자 목록 조회 권한 없음"));
    }
  }, [post, currentUserId, postId]);

  const checkAppliedStatus = async () => {
    try {
      const res = await api.get<boolean>(`/posts/${postId}/applied`);
      setHasApplied(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyMessage || !applyContact) {
      alert("메시지와 연락처를 모두 입력해주세요.");
      return;
    }

    try {
      await api.post(`/posts/${postId}/apply`, {
        message: applyMessage,
        contactInfo: applyContact
      });
      alert("신청이 완료되었습니다!");
      setHasApplied(true);
      setShowApplyForm(false);
    } catch (err) {
      console.error(err);
      alert("신청에 실패했습니다. (이미 신청했거나 오류가 발생했습니다)");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/posts/${postId}`);
      alert("삭제되었습니다.");
      navigate("/posts");
    } catch (err) {
      console.error(err);
      alert("삭제 실패");
    }
  };

  if (!post) return <Layout pageTitle="Loading..."><div className="p-10 text-center text-white">Loading...</div></Layout>;

  const isAuthor = currentUserId === post.authorId;

  return (
    <Layout pageTitle={post.title}>
      <section className="glass-card">
        {/* 상단 헤더: 카테고리 뱃지 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{
              backgroundColor: post.category === 'STUDY' ? '#3b82f6' : '#9ca3af',
              color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'
            }}>
              {post.category === 'STUDY' ? '스터디' : (post.category === 'QNA' ? '질문' : '자유')}
            </span>
            {post.category === 'STUDY' && (
              <span style={{ backgroundColor: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {post.recruitmentStatus === 'OPEN' ? '모집중' : '마감됨'}
              </span>
            )}
          </div>

          {isAuthor && (
             <button onClick={handleDelete} style={{ color: '#fca5a5', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>
               삭제
             </button>
          )}
        </div>

        {/* 제목 & 작성자 */}
        <h1 className="card-title" style={{ fontSize: '1.8rem', marginBottom: '10px' }}>{post.title}</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px' }}>
          <span>작성자: {post.authorName || "익명"}</span>
          <span>❤️ {post.likeCount}</span>
        </div>

        {/* ★ 스터디 정보 박스 (흰 배경 + 검은 글씨) */}
        {post.category === "STUDY" && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            color: '#000000', // 검은 글씨
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#2563eb', fontWeight: 'bold', fontSize: '1.1rem' }}>📢 스터디 모집 정보</h3>
            <p style={{ margin: '5px 0' }}><strong>📍 진행 방식:</strong> {post.studyType === 'ONLINE' ? '온라인' : (post.studyType === 'OFFLINE' ? '오프라인' : '온/오프라인 혼합')}</p>
            {post.contactLink && (
              <p style={{ margin: '5px 0' }}>
                <strong>🔗 오픈채팅방:</strong> <a href={post.contactLink} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline', marginLeft: '5px' }}>바로가기</a>
              </p>
            )}
          </div>
        )}

        {/* 본문 내용 */}
        <div style={{ minHeight: '150px', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '30px', color: 'rgba(255,255,255,0.9)' }}>
          {post.content}
        </div>

        {/* 첨부파일 */}
        {post.attachmentUrls && post.attachmentUrls.length > 0 && (
          <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '10px' }}>📎 첨부파일</h4>
            {post.attachmentUrls.map((url, idx) => (
              <a key={idx} href={url} target="_blank" rel="noreferrer" style={{ display: 'block', color: '#60a5fa', textDecoration: 'underline', marginBottom: '5px' }}>
                파일 {idx + 1} 다운로드
              </a>
            ))}
          </div>
        )}

        <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '30px 0' }} />

        {/* === [핵심] 스터디 신청 구역 === */}
        {post.category === "STUDY" && (
          <div>
            {isAuthor ? (
              // 1. 작성자: 신청자 명단 보기 (흰색 카드 + 검은 글씨)
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px' }}>📝 신청자 명단 ({applicants.length}명)</h3>

                {applicants.length === 0 ? (
                  <p style={{ color: '#9ca3af' }}>아직 신청자가 없습니다.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {applicants.map((app, idx) => (
                      <div key={idx} style={{
                          backgroundColor: '#ffffff', // 흰색 배경
                          color: '#000000',           // 검은 글씨
                          padding: '15px',
                          borderRadius: '8px',
                          display: 'flex', flexDirection: 'column', gap: '5px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '5px' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{app.applicantName}</span>
                          <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{new Date(app.appliedAt).toLocaleDateString()}</span>
                        </div>
                        <div style={{ padding: '5px 0' }}>"{app.message}"</div>
                        <div style={{ fontWeight: 'bold', color: '#16a34a' }}>📞 연락처: {app.contactInfo}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // 2. 방문자: 신청하기 기능
              <div style={{ textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '10px' }}>
                {hasApplied ? (
                  <div style={{ padding: '20px', backgroundColor: 'rgba(16, 185, 129, 0.2)', borderRadius: '8px', color: '#34d399', fontWeight: 'bold' }}>
                    ✅ 이미 신청한 스터디입니다. (작성자의 연락을 기다려주세요)
                  </div>
                ) : (
                  <>
                    {!showApplyForm ? (
                      <button
                        onClick={() => setShowApplyForm(true)}
                        className="primary-btn"
                        style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }}
                      >
                        ✋ 저도 참여하고 싶어요! (신청하기)
                      </button>
                    ) : (
                      <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#60a5fa' }}>신청서 작성</h3>

                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>신청 메시지</label>
                          <textarea
                            value={applyMessage}
                            onChange={(e) => setApplyMessage(e.target.value)}
                            placeholder="예: 열심히 하겠습니다! 평일 저녁 시간 가능합니다."
                            style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#ffffff', color: '#000000' }} // ★ 흰 배경 검은 글씨
                            required
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>연락처 (필수)</label>
                          <input
                            type="text"
                            value={applyContact}
                            onChange={(e) => setApplyContact(e.target.value)}
                            placeholder="예: 카톡ID dango123 또는 010-1234-5678"
                            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#ffffff', color: '#000000' }} // ★ 흰 배경 검은 글씨
                            required
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                          <button
                            type="button"
                            onClick={() => setShowApplyForm(false)}
                            className="secondary-btn"
                            style={{ flex: 1 }}
                          >
                            취소
                          </button>
                          <button
                            type="submit"
                            className="primary-btn"
                            style={{ flex: 2 }}
                          >
                            신청 완료 보내기
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </Layout>
  );
}