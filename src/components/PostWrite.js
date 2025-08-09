import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/apiService";
import "./Board.css";

const PostWrite = () => {
  const [formData, setFormData] = useState({
    postTitle: "",
    postContent: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.postTitle.trim() || !formData.postContent.trim()) {
      setError("제목과 내용을 모두 입력해주세요.");
      setLoading(false);
      return;
    }

    try {
      const postData = {
        postTitle: formData.postTitle.trim(),
        postContent: formData.postContent.trim(),
        memberNo: user.memberNo || user.userId, // 백엔드 응답에 따라 조정
      };

      const response = await apiService.createPost(postData);

      if (response.data.success) {
        alert("게시글이 성공적으로 작성되었습니다.");
        navigate("/board");
      } else {
        setError(response.data.message || "게시글 작성에 실패했습니다.");
      }
    } catch (error) {
      console.error("Post creation error:", error);
      setError("게시글 작성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="board-container">
      <header className="board-header">
        <h1>게시글 작성</h1>
        <div className="header-controls">
          <button onClick={() => navigate("/board")} className="back-btn">
            목록으로
          </button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <label htmlFor="postTitle">제목:</label>
          <input
            type="text"
            id="postTitle"
            name="postTitle"
            value={formData.postTitle}
            onChange={handleChange}
            placeholder="게시글 제목을 입력하세요"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="postContent">내용:</label>
          <textarea
            id="postContent"
            name="postContent"
            value={formData.postContent}
            onChange={handleChange}
            placeholder="게시글 내용을 입력하세요"
            rows="15"
            required
            disabled={loading}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/board")}
            className="cancel-btn"
            disabled={loading}
          >
            취소
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "작성 중..." : "작성 완료"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostWrite;
