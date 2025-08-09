import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/apiService";
import "./Board.css";

const BoardList = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pageSize = 10;

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  const fetchPosts = async (page) => {
    setLoading(true);
    setError("");

    try {
      console.log("게시물 요청 페이지:", page);
      const response = await apiService.getPosts(page, pageSize);
      const data = response.data;
      console.log("게시물 응답 데이터:", data);

      setPosts(data.posts || []);
      setCurrentPage(data.currentPage + 1); // 백엔드는 0부터, 프론트엔드는 1부터
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      setError("게시글을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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

  return (
    <div className="board-container">
      <header className="board-header">
        <h1>게시판</h1>
        <div className="header-controls">
          <span>안녕하세요, {user?.memberName || user?.username}님!</span>
          <button
            onClick={() => navigate("/board/write")}
            className="write-btn"
          >
            글쓰기
          </button>
          <button onClick={logout} className="logout-btn">
            로그아웃
          </button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">로딩 중...</div>
      ) : (
        <>
          <div className="board-stats">총 {totalCount}개의 게시글</div>

          <div className="posts-table">
            <div className="table-header">
              <div className="col-id">번호</div>
              <div className="col-title">제목</div>
              <div className="col-author">작성자</div>
              <div className="col-date">작성일</div>
              <div className="col-views">조회수</div>
            </div>

            {posts.length === 0 ? (
              <div className="no-posts">게시글이 없습니다.</div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.postId}
                  className="table-row"
                  onClick={() => navigate(`/board/post/${post.postId}`)}
                >
                  <div className="col-id">{post.postId}</div>
                  <div className="col-title">{post.postTitle}</div>
                  <div className="col-author">{post.memberName}</div>
                  <div className="col-date">
                    {formatDate(post.postCreatedAt)}
                  </div>
                  <div className="col-views">{post.postViewCount}</div>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="page-btn"
              >
                이전
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`page-btn ${
                      currentPage === page ? "active" : ""
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="page-btn"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BoardList;
