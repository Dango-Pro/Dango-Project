import { useEffect, useState } from 'react';
import { api } from '../libs/api';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Post } from '../types/post';

export default function PostsPage() {
	const { t } = useTranslation();

	// 상태 관리: 중복 선언 제거 및 통합
	const [posts, setPosts] = useState<Post[]>([]);
	const [status, setStatus] = useState('');
	const [query, setQuery] = useState('');
	const [currentUserId, setCurrentUserId] = useState<number | null>(null);

	// 1. 사용자 정보 가져오기 (마운트 시 1회 실행)
	useEffect(() => {
		const token = localStorage.getItem('token');
		if (token) {
			api
				.get<{ id: number }>('/users/me')
				.then((res) => setCurrentUserId(res.data.id))
				.catch(() => setCurrentUserId(null));
		}
	}, []);

	// 2. 게시글 목록 가져오기 (query 변경 시 실행)
	useEffect(() => {
		const loadPosts = async () => {
			setStatus(t('common.loading'));
			try {
				const params = new URLSearchParams();
				if (query) params.append('q', query);

				// async/await 구조로 안정적인 데이터 수신
				const response = await api.get<Post[]>('/posts', { params });
				setPosts(response.data);
				setStatus(response.data.length ? '' : t('post_detail.no_posts_found'));
			} catch (error) {
				console.error("Failed to fetch posts:", error);
				setStatus(t('post_detail.fail_load_posts'));
			}
		};

		loadPosts();
	}, [query, t]);

	return (
		<Layout pageTitle={t('post_detail.posts_title')}>
			<section className="glass-card">
				{/* 헤더 영역: 제목 및 글쓰기 버튼 */}
				<div className="card-header">
					<h2 className="card-title">{t('post_detail.posts_title')}</h2>
					<Link to="/posts/create" className="primary-btn">
						{t('post.new_post')}
					</Link>
				</div>

				{/* 로딩/에러 상태 메시지 */}
				<p className="muted" style={{ marginBottom: '15px' }}>{status}</p>

				{/* 게시글 리스트 그리드 */}
				<div className="card-grid">
					{posts.map((p) => (
						<article key={p.id} className="item-tile">
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>

								{/* 왼쪽: 게시글 내용 정보 */}
								<div style={{ flex: 1 }}>
									<Link to={`/posts/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
										<h3 className="item-title">
											{p.isNotice && (
												<span style={{ color: '#ff6b6b', marginRight: 8, fontWeight: 'bold' }}>
                          {t('home.notice_tag')}
                        </span>
											)}
											{p.title}
										</h3>
									</Link>
									<div className="item-subtitle" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
										<span>{t('post_detail.by_author', { name: p.authorName || t('post_detail.unknown_author') })}</span>
									</div>

									{/* 좋아요 및 댓글 링크 */}
									<div style={{ marginTop: 8, display: 'flex', gap: 10, fontSize: '0.85rem', alignItems: 'center' }} className="muted">
										<button
											className="secondary-btn"
											style={{ padding: '4px 8px', fontSize: '0.8rem' }}
											onClick={() => {
												api.post(`/posts/${p.id}/like`)
													.then((res) => {
														setPosts(posts.map((post) => (post.id === p.id ? res.data : post)));
													})
													.catch(console.error);
											}}
										>
											♥ {p.likeCount}
										</button>
										<Link to={`/posts/${p.id}`} className="muted" style={{ textDecoration: 'underline' }}>
											{t('post_detail.view_comments')}
										</Link>
									</div>
								</div>

								{/* 오른쪽: 수정/삭제 버튼 (작성자 본인에게만 표시) */}
								{currentUserId && p.authorId === currentUserId && (
									<div style={{ display: 'flex', gap: 8 }}>
										<Link to={`/posts/${p.id}/edit`} className="muted" style={{ fontSize: '0.8rem', textDecoration: 'underline' }}>
											{t('common.edit')}
										</Link>
										<button
											onClick={() => {
												if (window.confirm(t('post_detail.delete_post_confirm'))) {
													api.delete(`/posts/${p.id}`)
														.then(() => {
															setPosts(posts.filter((post) => post.id !== p.id));
														})
														.catch(() => alert(t('post_detail.fail_delete_post')));
												}
											}}
											className="muted"
											style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline', padding: 0 }}
										>
											{t('common.delete')}
										</button>
									</div>
								)}
							</div>
						</article>
					))}
				</div>

				{/* 하단 검색창: 제하 님의 레이아웃 고정 철학 반영 */}
				<div style={{ marginTop: 20 }}>
					<input
						className="input-field"
						style={{ width: '100%' }}
						placeholder={t('post_detail.search_placeholder')}
						value={query}
						onChange={(e) => setQuery(e.target.value)}
					/>
				</div>
			</section>
		</Layout>
	);
}