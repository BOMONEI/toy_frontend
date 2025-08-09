import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/apiService";
import "./Board.css";

const PostEdit = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { postId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await apiService.getPost(postId);
        const postData = response.data;

        // 작성자 권한 확인
        if (
          !user ||
          (user.memberNo !== postData.memberNo &&
            user.userId !== postData.memberNo)
        ) {
          setError("게시글을 수정할 권한이 없습니다.");
          return;
        }

        setTitle(postData.postTitle);
        setContent(postData.postContent);
      } catch (error) {
        console.error("Failed to fetch post:", error);
        setError("게시글을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    fetchPost();
  }, [postId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    setSubmitting(true);

    try {
      const postData = {
        postTitle: title,
        postContent: content,
        memberNo: user.memberNo,
      };

      const response = await apiService.updatePost(postId, postData);

      if (response.data.success) {
        alert("게시글이 수정되었습니다.");
        navigate(`/board/post/${postId}`);
      } else {
        alert("게시글 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("게시글 수정 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="board-container">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="board-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate("/board")} className="back-btn">
          목록으로
        </button>
      </div>
    );
  }

  return (
    <div className="board-container">
      <header className="board-header">
        <h1>게시글 수정</h1>
        <div className="header-controls">
          <button
            onClick={() => navigate(`/board/post/${postId}`)}
            className="back-btn"
          >
            취소
          </button>
        </div>
      </header>

      <div className="post-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">제목</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="form-input"
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">내용</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요"
              rows="15"
              className="form-textarea"
              disabled={submitting}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? "수정 중..." : "수정하기"}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/board/post/${postId}`)}
              className="cancel-btn"
              disabled={submitting}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostEdit;
