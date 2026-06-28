import { Navigate } from "react-router-dom";
import { canAccessAgentPanel, getStoredUser } from "../utils/helpers";

const AgentRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = getStoredUser();

  if (!token) return <Navigate to="/login" replace />;
  if (!canAccessAgentPanel(user)) return <Navigate to="/" replace />;

  return children;
};

export default AgentRoute;
