import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/apiService";
import "./Board.css";

const PostDetail = () => {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState("");

  // 댓글 수정 관련 state
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  const { postId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await apiService.getPost(postId);
        setPost(response.data);
        // 게시글을 가져온 후 댓글도 가져오기
        await fetchComments();
      } catch (error) {
        console.error("Failed to fetch post:", error);
        setError("게시글을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      setCommentsLoading(true);
      try {
        const response = await apiService.getCommentsByPostId(postId);
        setComments(response.data);
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleDelete = async () => {
    if (!window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await apiService.deletePost(postId);
      if (response.data.success) {
        alert("게시글이 삭제되었습니다.");
        navigate("/board");
      } else {
        alert("게시글 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("게시글 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!newComment.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const commentData = {
        commentContent: newComment,
        memberNo: user.memberNo,
      };

      const response = await apiService.createComment(postId, commentData);
      if (response.data.success) {
        setNewComment("");
        // 댓글 목록 새로고침
        const commentsResponse = await apiService.getCommentsByPostId(postId);
        setComments(commentsResponse.data);
      } else {
        alert("댓글 작성에 실패했습니다.");
      }
    } catch (error) {
      console.error("Comment submission error:", error);
      alert("댓글 작성 중 오류가 발생했습니다.");
    }
  };

  const handleReplySubmit = async (parentCommentId) => {
    console.log(
      "handleReplySubmit called with parentCommentId:",
      parentCommentId
    );
    console.log("replyText:", replyText);
    console.log("user:", user);

    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!replyText.trim()) {
      alert("답글 내용을 입력해주세요.");
      return;
    }

    try {
      const replyData = {
        commentContent: replyText,
        memberNo: user.memberNo,
        parentCommentId: parentCommentId,
      };

      console.log("Sending reply data:", replyData);

      const response = await apiService.createComment(postId, replyData);
      console.log("Reply response:", response);

      if (response.data.success) {
        setReplyText("");
        setReplyingTo(null);
        // 댓글 목록 새로고침
        const commentsResponse = await apiService.getCommentsByPostId(postId);
        setComments(commentsResponse.data);
        console.log("Comments refreshed after reply");
      } else {
        alert("답글 작성에 실패했습니다.");
      }
    } catch (error) {
      console.error("Reply submission error:", error);
      alert("답글 작성 중 오류가 발생했습니다.");
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await apiService.deleteComment(commentId);
      if (response.data.success) {
        // 댓글 목록 새로고침
        const commentsResponse = await apiService.getCommentsByPostId(postId);
        setComments(commentsResponse.data);
      } else {
        alert("댓글 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Comment delete error:", error);
      alert("댓글 삭제 중 오류가 발생했습니다.");
    }
  };

  // 댓글 수정 시작
  const handleCommentEditStart = (comment) => {
    setEditingComment(comment.commentId);
    setEditCommentText(comment.commentContent);
  };

  // 댓글 수정 취소
  const handleCommentEditCancel = () => {
    setEditingComment(null);
    setEditCommentText("");
  };

  // 댓글 수정 저장
  const handleCommentEditSave = async (commentId) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!editCommentText.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const updateData = {
        commentContent: editCommentText,
        memberNo: user.memberNo,
      };

      const response = await apiService.updateComment(commentId, updateData);
      if (response.data.success) {
        setEditingComment(null);
        setEditCommentText("");
        // 댓글 목록 새로고침
        const commentsResponse = await apiService.getCommentsByPostId(postId);
        setComments(commentsResponse.data);
        alert("댓글이 수정되었습니다.");
      } else {
        alert("댓글 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("Comment update error:", error);
      alert("댓글 수정 중 오류가 발생했습니다.");
    }
  };

  const getTotalCommentCount = () => {
    let total = 0;
    comments.forEach((comment) => {
      total += 1; // 댓글 자체
      if (comment.replies && comment.replies.length > 0) {
        total += comment.replies.length; // 대댓글들
      }
    });
    return total;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatContent = (content) => {
    return content.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  if (loading) {
    return (
      <div className="board-container">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="board-container">
        <div className="error-message">
          {error || "게시글을 찾을 수 없습니다."}
        </div>
        <button onClick={() => navigate("/board")} className="back-btn">
          목록으로
        </button>
      </div>
    );
  }

  const isAuthor =
    user && (user.memberNo === post.memberNo || user.userId === post.memberNo);

  return (
    <div className="board-container">
      <header className="board-header">
        <h1>게시글 상세</h1>
        <div className="header-controls">
          <button onClick={() => navigate("/board")} className="back-btn">
            목록으로
          </button>
        </div>
      </header>

      <div className="post-detail">
        <div className="post-header">
          <h2>{post.postTitle}</h2>
          <div className="post-info">
            <span className="author">작성자: {post.memberName}</span>
            <span className="date">
              작성일: {formatDate(post.postCreatedAt)}
            </span>
            <span className="views">조회수: {post.postViewCount}</span>
          </div>
        </div>

        <div className="post-content">{formatContent(post.postContent)}</div>

        {isAuthor && (
          <div className="post-actions">
            <button
              onClick={() => navigate(`/board/edit/${postId}`)}
              className="edit-btn"
            >
              수정
            </button>
            <button onClick={handleDelete} className="delete-btn">
              삭제
            </button>
          </div>
        )}
      </div>

      {/* 댓글 섹션 */}
      <div className="comments-section">
        <h3>댓글 ({getTotalCommentCount()})</h3>

        {/* 댓글 작성 폼 */}
        {user ? (
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <div className="comment-input-group">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                rows="3"
                className="comment-textarea"
              />
              <button type="submit" className="comment-submit-btn">
                댓글 작성
              </button>
            </div>
          </form>
        ) : (
          <div className="login-required">
            댓글을 작성하려면 로그인이 필요합니다.
          </div>
        )}

        {/* 댓글 목록 */}
        <div className="comments-list">
          {commentsLoading ? (
            <div className="loading">댓글을 불러오는 중...</div>
          ) : (
            <>
              {comments.map((comment) => (
                <div key={comment.commentId} className="comment">
                  <div className="comment-header">
                    <span className="comment-author">{comment.memberName}</span>
                    <span className="comment-date">
                      {formatDate(comment.commentCreatedAt)}
                    </span>
                    {user && user.memberNo === comment.memberNo && (
                      <div className="comment-actions">
                        {editingComment !== comment.commentId && (
                          <>
                            <button
                              onClick={() => handleCommentEditStart(comment)}
                              className="comment-edit-btn"
                            >
                              수정
                            </button>
                            <button
                              onClick={() =>
                                handleCommentDelete(comment.commentId)
                              }
                              className="comment-delete-btn"
                            >
                              삭제
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 댓글 내용 - 수정 모드인지 확인 */}
                  {editingComment === comment.commentId ? (
                    <div className="comment-edit-form">
                      <textarea
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        className="comment-edit-textarea"
                        rows="3"
                      />
                      <div className="comment-edit-buttons">
                        <button
                          onClick={() =>
                            handleCommentEditSave(comment.commentId)
                          }
                          className="comment-save-btn"
                        >
                          저장
                        </button>
                        <button
                          onClick={handleCommentEditCancel}
                          className="comment-cancel-btn"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="comment-content">
                      {comment.commentContent}
                    </div>
                  )}

                  {/* 답글 버튼 */}
                  {user && (
                    <button
                      onClick={() =>
                        setReplyingTo(
                          replyingTo === comment.commentId
                            ? null
                            : comment.commentId
                        )
                      }
                      className="reply-btn"
                    >
                      답글
                    </button>
                  )}

                  {/* 답글 작성 폼 */}
                  {replyingTo === comment.commentId && (
                    <div className="reply-form">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="답글을 입력하세요..."
                        rows="2"
                        className="reply-textarea"
                      />
                      <div className="reply-buttons">
                        <button
                          onClick={() => handleReplySubmit(comment.commentId)}
                          className="reply-submit-btn"
                        >
                          답글 작성
                        </button>
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText("");
                          }}
                          className="reply-cancel-btn"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 대댓글 목록 */}
                  <div className="replies">
                    {comment.replies &&
                      comment.replies.length > 0 &&
                      comment.replies.map((reply) => (
                        <div key={reply.commentId} className="reply">
                          <div className="reply-header">
                            <span className="reply-author">
                              {reply.memberName}
                            </span>
                            <span className="reply-date">
                              {formatDate(reply.commentCreatedAt)}
                            </span>
                            {user && user.memberNo === reply.memberNo && (
                              <div className="reply-actions">
                                {editingComment !== reply.commentId && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleCommentEditStart(reply)
                                      }
                                      className="reply-edit-btn"
                                    >
                                      수정
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleCommentDelete(reply.commentId)
                                      }
                                      className="reply-delete-btn"
                                    >
                                      삭제
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          {/* 답글 내용 - 수정 모드인지 확인 */}
                          {editingComment === reply.commentId ? (
                            <div className="reply-edit-form">
                              <textarea
                                value={editCommentText}
                                onChange={(e) =>
                                  setEditCommentText(e.target.value)
                                }
                                className="reply-edit-textarea"
                                rows="2"
                              />
                              <div className="reply-edit-buttons">
                                <button
                                  onClick={() =>
                                    handleCommentEditSave(reply.commentId)
                                  }
                                  className="reply-save-btn"
                                >
                                  저장
                                </button>
                                <button
                                  onClick={handleCommentEditCancel}
                                  className="reply-cancel-btn"
                                >
                                  취소
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="reply-content">
                              {reply.commentContent}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
