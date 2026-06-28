import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Auth from "./auth/Auth";
import Dashboard from "./pages/Dashboard";
import AgentDashboard from "./pages/AgentDashboard";
import SavedHouses from "./pages/SavedHouses";
import Houses from "./pages/Houses";
import HouseDetails from "./pages/HouseDetails";
import AdminRoute from "./routes/AdminRoute";
import AgentRoute from "./routes/AgentRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ApplyAgent from "./pages/ApplyAgent";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/houses" element={<Houses />} />
        <Route path="/houses/:id" element={<HouseDetails />} />
        <Route path="/apply-agent" element={<ApplyAgent />} />
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/agent"
          element={
            <AgentRoute>
              <AgentDashboard />
            </AgentRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <SavedHouses />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
