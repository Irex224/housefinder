import { Navigate } from "react-router-dom";
import { canAccessDashboard, getStoredUser } from "../utils/helpers";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = getStoredUser();

  if (!token) return <Navigate to="/login" replace />;
  if (!canAccessDashboard(user)) return <Navigate to="/" replace />;

  return children;
};

export default AdminRoute;
