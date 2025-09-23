import { Routes, Route } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/User/Dashboard";
import CompleteProfile from "./pages/User/CompleteProfile";
import AdminPanel from "./pages/Admin/AdminPanel";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import Layout from "./components/Layout";
import MyProfile from "./pages/User/MyProfile";
import CreatePost from "./pages/User/CreatePost";
import PostDetails from "./pages/User/PostDetails";
import Homefeed from "./pages/Feed/Homefeed";
import Exploresection from "./pages/Feed/Exploresection";
import OtherProfile from "./pages/User/OtherProfile";
import TrendingPage from "./pages/User/TrendingPage";
import SavedPosts from "./pages/User/SavedPosts";
import ConversationsPage from "./pages/User/ConversationsPage";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import ResendVerifyEmail from "./pages/Auth/ResendVerifyEmail";
import VerifyEmailPage from "./pages/Auth/VerifyEmailPage";
import UpdatePost from "./pages/User/UpdatePost";
import VideoFeed from "./components/VideoFeed";
const App = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/Resend-verify-email" element={<ResendVerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/explore" element={<Exploresection />} />

            <Route path="/" element={<Homefeed />} />
            <Route path="/video-feed" element={<VideoFeed />} />

            <Route path="/post/:id" element={<PostDetails />} />
            <Route path="/myprofile" element={<MyProfile />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/trending-posts" element={<TrendingPage />} />
            <Route path="/saved-posts" element={<SavedPosts />} />
            <Route path="/create-Post" element={<CreatePost />} />
            <Route path="/conversation-list" element={<ConversationsPage />} />
            <Route path="/profile/:id" element={<OtherProfile />} />
            <Route path="/post/update/:pid" element={<UpdatePost />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Routes>
      </Layout>
    </div>
  );
};

export default App;
