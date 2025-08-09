import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/apiService";
import "./Auth.css";

const Login = () => {
  const [formData, setFormData] = useState({
    memberId: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
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

    try {
      console.log("로그인 요청 데이터:", formData);
      const response = await apiService.login(formData);
      console.log("로그인 응답:", response.data);

      if (response.data.success) {
        // 백엔드 응답 구조에 맞게 사용자 데이터 구성
        const userData = {
          memberNo: response.data.memberNo,
          memberName: response.data.memberName,
          memberId: response.data.memberId,
          token: response.data.token,
        };
        console.log("사용자 데이터 설정:", userData);
        login(userData);
        console.log("로그인 완료, /board로 이동");
        navigate("/board");
      } else {
        setError(response.data.message || "로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>로그인</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="memberId">사용자 ID:</label>
            <input
              type="text"
              id="memberId"
              name="memberId"
              value={formData.memberId}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="auth-link">
          계정이 없으신가요? <Link to="/register">회원가입</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
