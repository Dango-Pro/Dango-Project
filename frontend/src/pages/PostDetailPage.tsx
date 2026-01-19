import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { api } from "../libs/api";
import Layout from "../components/Layout";
import { useParams, Link } from "react-router-dom";
import type { Post } from "../types/post";
import type { Comment } from "../types/comment";

export default function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<number | null>(null); // ID of comment being replied to
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = () => {
    api.get<Post>(`/posts/${id}`).then(res => {
        setPost(res.data);
        setLoading(false);
    }).catch(console.error);
  };

  const fetchComments = () => {
    api.get<Comment[]>(`/posts/${id}/comments`).then(res => setComments(res.data)).catch(console.error);
  };

  const handleLike = async () => {
    if (!post) return;
    try {
      const res = await api.post<Post>(`/posts/${id}/like`);
      setPost(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post(`/posts/${id}/comments`, { content: newComment });
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async (e: React.FormEvent, parentId: number) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    try {
        await api.post(`/posts/${id}/comments?parentId=${parentId}`, { content: replyContent });
        setReplyContent("");
        setReplyTo(null);
        fetchComments();
    } catch(err) {
        console.error(err);
    }
  }

  const renderComments = (list: Comment[], depth = 0) => {
      return list.map(c => (
          <div key={c.id} style={{ marginLeft: depth * 20, marginTop: 10 }}>
              <div style={{ background: "rgba(255,255,255,0.05)", padding: 10, borderRadius: 8 }}>
                  <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>
                      {c.authorName || "Unknown"}
                  </div>
                  <div style={{ whiteSpace: "pre-wrap" }}>{c.content}</div>
                  <div style={{ marginTop: 8 }}>
                      <button
                        className="muted"
                        style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "0.8rem", textDecoration: "underline" }}
                        onClick={() => { setReplyTo(replyTo === c.id ? null : c.id); setReplyContent(""); }}
                      >
                          Reply
                      </button>
                  </div>
              </div>

              {replyTo === c.id && (
                  <form onSubmit={(e) => handleReply(e, c.id)} style={{ marginTop: 8, display: "flex", gap: 8, marginLeft: 10 }}>
                      <input
                        className="input-field"
                        style={{ flex: 1, fontSize: "0.9rem", padding: "6px" }}
                        placeholder="Write a reply..."
                        value={replyContent}
                        onChange={e => setReplyContent(e.target.value)}
                        autoFocus
                      />
                      <button type="submit" className="secondary-btn" style={{ fontSize: "0.8rem" }}>Reply</button>
                  </form>
              )}

              {c.replies && c.replies.length > 0 && renderComments(c.replies, depth + 1)}
          </div>
      ));
  };

  if (loading) return <Layout pageTitle="Loading..."><p>Please wait</p></Layout>;
  if (!post) return <Layout pageTitle="Not Found"><p>Post not found.</p></Layout>;

  return (
    <Layout pageTitle={post.title}>
      <section className="glass-card">
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "10px", lineHeight: 1.2 }}>{post.title}</h1>
        <div style={{ marginBottom: 20, fontSize: "0.9rem", color: "rgba(255,255,255,0.6)" }}>
            By {post.authorName || "Unknown"}
        </div>
        <div
          className="post-content"
          style={{ lineHeight: 1.6, marginBottom: 20 }}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />

        {post.attachmentUrls && post.attachmentUrls.length > 0 && (
          <div style={{ marginBottom: 20 }}>
             <h4 style={{ marginBottom: 10 }}>Attachments</h4>
             <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {post.attachmentUrls.map((url, idx) => {
                    const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)$/i);
                    const fileName = url.split('/').pop();
                    return (
                        <div key={idx} style={{ background: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 5 }}>
                            {isImage ? (
                                <a href={url} target="_blank" rel="noreferrer">
                                  <img src={url} alt={fileName} style={{ maxWidth: 200, maxHeight: 200, display: 'block' }} />
                                </a>
                            ) : (
                                <a href={url} target="_blank" rel="noreferrer" style={{ color: '#aaa', textDecoration: 'underline' }}>{fileName}</a>
                            )}
                        </div>
                    );
                })}
             </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
           <button className="secondary-btn" onClick={handleLike}>
              ♥ Like {post.likeCount}
           </button>
           <Link to="/posts" className="muted" style={{ textDecoration: 'underline' }}>Back to List</Link>
        </div>

        <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: "20px 0" }} />

        <h3 className="item-title" style={{ marginBottom: 15 }}>Comments</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
           {renderComments(comments)}
           {comments.length === 0 && <p className="muted">No comments yet.</p>}
        </div>

        <h4 style={{ fontSize: "1rem", marginBottom: 10 }}>Leave a comment</h4>
        <form onSubmit={handleAddComment} style={{ display: "flex", gap: 10 }}>
           <input
             className="input-field"
             style={{ flex: 1 }}
             placeholder="Add a comment..."
             value={newComment}
             onChange={e => setNewComment(e.target.value)}
           />
           <button type="submit" className="primary-btn">Post</button>
        </form>
      </section>
    </Layout>
  );
}
