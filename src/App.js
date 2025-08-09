import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import BoardList from "./components/BoardList";
import PostWrite from "./components/PostWrite";
import PostDetail from "./components/PostDetail";
import PostEdit from "./components/PostEdit";
import "./App.css";

// Protected Route 컴포넌트
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route 컴포넌트 (로그인된 사용자는 리다이렉트)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return !isAuthenticated ? children : <Navigate to="/board" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/board"
              element={
                <ProtectedRoute>
                  <BoardList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/board/write"
              element={
                <ProtectedRoute>
                  <PostWrite />
                </ProtectedRoute>
              }
            />
            <Route
              path="/board/post/:postId"
              element={
                <ProtectedRoute>
                  <PostDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/board/edit/:postId"
              element={
                <ProtectedRoute>
                  <PostEdit />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/board" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
