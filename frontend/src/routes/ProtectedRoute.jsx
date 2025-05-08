import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const ProtectedRoute = () => {
  const { user } = useAuth();

  return user ? <Outlet /> : <Loader to="/login" />;
};

export default ProtectedRoute;
