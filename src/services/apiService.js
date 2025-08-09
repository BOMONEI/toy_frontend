import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// JWT 토큰을 localStorage에서 가져오는 함수
const getToken = () => {
  return localStorage.getItem("token");
};

// 요청 인터셉터 - 모든 요청에 JWT 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && !config.url.startsWith("/auth")) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 401 에러 시 토큰 제거 및 로그인 페이지로 이동
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API 서비스
export const apiService = {
  // 회원가입
  register: (userData) => {
    return api.post("/auth/user/register", userData);
  },

  // 로그인
  login: (loginData) => {
    return api.post("/auth/user/login", loginData);
  },

  // 게시글 목록 조회
  getPosts: (page = 1, size = 10) => {
    // 프론트엔드는 1부터 시작, 백엔드는 0부터 시작하므로 -1
    const backendPage = page - 1;
    return api.get(`/api/board/posts?page=${backendPage}&size=${size}`);
  },

  // 게시글 상세 조회
  getPost: (postId) => {
    return api.get(`/api/board/posts/${postId}`);
  },

  // 게시글 작성
  createPost: (postData) => {
    return api.post("/api/board/posts", postData);
  },

  // 게시글 수정
  updatePost: (postId, postData) => {
    return api.put(`/api/board/posts/${postId}`, postData);
  },

  // 게시글 삭제
  deletePost: (postId) => {
    return api.delete(`/api/board/posts/${postId}`);
  },

  // 특정 회원의 게시글 목록
  getPostsByMember: (memberNo) => {
    return api.get(`/api/board/posts/member/${memberNo}`);
  },

  // === 댓글 관련 API ===

  // 특정 게시글의 댓글 목록 조회
  getCommentsByPostId: (postId) => {
    return api.get(`/api/board/posts/${postId}/comments`);
  },

  // 댓글 작성
  createComment: (postId, commentData) => {
    return api.post(`/api/board/posts/${postId}/comments`, commentData);
  },

  // 댓글 삭제
  deleteComment: (commentId) => {
    return api.delete(`/api/board/comments/${commentId}`);
  },

  // 댓글 수정
  updateComment: (commentId, commentData) => {
    return api.put(`/api/board/comments/${commentId}`, commentData);
  },
};

export default apiService;
