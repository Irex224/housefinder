import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import HouseList from "../components/HouseList";

const Dashboard = () => {
  const navigate = useNavigate();

  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agentApplications, setAgentApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [showInquiries, setShowInquiries] = useState(false);
  const [showAgentApplications, setShowAgentApplications] = useState(true);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [editingHouseId, setEditingHouseId] = useState(null);
  const [formData, setFormData] = useState({
    location: "",
    price: "",
    bedrooms: "",
    description: "",
    images: [],
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Fetch houses
  useEffect(() => {
    fetchHouses();
    fetchAgentApplications();
  }, []);

  const fetchHouses = async () => {
    try {
      const res = await api.get("/houses");
      setHouses(res.data);
    } catch (err) {
      console.error("Error fetching houses:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentApplications = async () => {
    try {
      const res = await api.get("/agents/applications");
      setAgentApplications(res.data);
    } catch (err) {
      console.error("Error fetching agent applications:", err);
    } finally {
      setLoadingApplications(false);
    }
  };

  const fetchInquiries = async () => {
    setLoadingInquiries(true);
    try {
      const res = await api.get("/inquiries");
      setInquiries(res.data);
    } catch (err) {
      console.error("Error fetching inquiries:", err);
    } finally {
      setLoadingInquiries(false);
    }
  };

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const res = await api.get("/reports");
      setReports(res.data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      images: e.target.files,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("location", formData.location);
    form.append("price", formData.price);
    form.append("bedrooms", formData.bedrooms);
    form.append("description", formData.description);

    if (formData.images && formData.images.length > 0) {
      for (let i = 0; i < formData.images.length; i += 1) {
        form.append("images", formData.images[i]);
      }
    }

    try {
      if (editingHouseId) {
        await api.put(`/houses/${editingHouseId}`, form, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        alert("✅ House updated successfully!");
      } else {
        await api.post("/houses", form, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        alert("🏠 House added successfully!");
      }

      setFormData({
        location: "",
        price: "",
        bedrooms: "",
        description: "",
        images: [],
      });
      setEditingHouseId(null);
      fetchHouses();
    } catch (err) {
      console.error("Error saving house:", err);
      alert("Failed to save house.");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this house?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/houses/${id}`);
      fetchHouses();
    } catch (err) {
      console.error("Error deleting house:", err);
      alert("Failed to delete house");
    }
  };

  const handleEdit = (house) => {
    setEditingHouseId(house._id);
    setFormData({
      location: house.location || "",
      price: house.price || "",
      bedrooms: house.bedrooms || "",
      description: house.description || "",
      images: [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApproveApplication = async (id) => {
    try {
      await api.put(`/agents/${id}/approve`);
      fetchAgentApplications();
    } catch (err) {
      console.error("Error approving application:", err);
      alert("Failed to approve application");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <button
        onClick={handleLogout}
        style={{
          background: "crimson",
          color: "white",
          padding: "8px 14px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        Logout
      </button>

      <h1>🏡 HouseFinder Dashboard</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          required
          style={{ marginRight: "10px" }}
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          required
          style={{ marginRight: "10px" }}
        />
        <input
          type="number"
          name="bedrooms"
          placeholder="Bedrooms"
          value={formData.bedrooms}
          onChange={handleChange}
          required
          style={{ marginRight: "10px" }}
        />
        <textarea
          name="description"
          placeholder="Property description"
          value={formData.description}
          onChange={handleChange}
          rows={2}
          style={{ marginRight: "10px", verticalAlign: "middle" }}
        />
        <input
          type="file"
          name="images"
          accept="image/*"
          multiple
          onChange={handleImageChange}
        />
        <button type="submit" style={{ marginLeft: "10px" }}>
          {editingHouseId ? "Update House" : "Add House"}
        </button>
      </form>

      {loading && <h2>Loading houses...</h2>}

      {!loading && houses.length === 0 && (
        <h2>No houses yet. Add your first listing.</h2>
      )}

      {!loading && houses.length > 0 && (
        <HouseList
          houses={houses}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <div style={{ marginTop: "40px" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button
            type="button"
            onClick={() => {
              setShowInquiries(true);
              setShowAgentApplications(false);
              setShowReports(false);
              fetchInquiries();
            }}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "1px solid #ddd",
              cursor: "pointer",
              background: "white",
            }}
          >
            View Inquiries
          </button>
          <button
            type="button"
            onClick={() => {
              setShowInquiries(false);
              setShowAgentApplications(true);
              setShowReports(false);
              fetchAgentApplications();
            }}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "1px solid #ddd",
              cursor: "pointer",
              background: "white",
            }}
          >
            View Agent Applications
          </button>
          <button
            type="button"
            onClick={() => {
              setShowInquiries(false);
              setShowAgentApplications(false);
              setShowReports(true);
              fetchReports();
            }}
            style={{
              padding: "8px 14px",
              borderRadius: "6px",
              border: "1px solid #ddd",
              cursor: "pointer",
              background: "white",
            }}
          >
            View Reports
          </button>
        </div>

        {showInquiries && (
          <div>
            <h2>Inquiries</h2>
            {loadingInquiries && <p>Loading inquiries...</p>}
            {!loadingInquiries && inquiries.length === 0 && (
              <p>No inquiries yet.</p>
            )}
            {!loadingInquiries && inquiries.length > 0 && (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: "10px",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                      Name
                    </th>
                    <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                      Email
                    </th>
                    <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                      Message
                    </th>
                    <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                      House ID
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inq) => (
                    <tr key={inq._id}>
                      <td
                        style={{
                          borderBottom: "1px solid #f0f0f0",
                          padding: "8px",
                        }}
                      >
                        {inq.name}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #f0f0f0",
                          padding: "8px",
                        }}
                      >
                        {inq.email}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #f0f0f0",
                          padding: "8px",
                          maxWidth: "360px",
                          wordBreak: "break-word",
                        }}
                      >
                        {inq.message}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #f0f0f0",
                          padding: "8px",
                        }}
                      >
                        {inq.houseId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {showAgentApplications && (
          <div>
            <h2>Agent Applications</h2>
            {loadingApplications && <p>Loading applications...</p>}
            {!loadingApplications && agentApplications.length === 0 && (
              <p>No agent applications yet.</p>
            )}
            {!loadingApplications && agentApplications.length > 0 && (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: "10px",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                      Name
                    </th>
                    <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                      Email
                    </th>
                    <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                      Area
                    </th>
                    <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                      Status
                    </th>
                    <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {agentApplications.map((app) => (
                    <tr key={app._id}>
                      <td
                        style={{
                          borderBottom: "1px solid #f0f0f0",
                          padding: "8px",
                        }}
                      >
                        {app.name}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #f0f0f0",
                          padding: "8px",
                        }}
                      >
                        {app.email}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #f0f0f0",
                          padding: "8px",
                        }}
                      >
                        {app.area || "-"}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #f0f0f0",
                          padding: "8px",
                        }}
                      >
                        {app.status}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #f0f0f0",
                          padding: "8px",
                        }}
                      >
                        {app.status !== "approved" && (
                          <button
                            onClick={() => handleApproveApplication(app._id)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "4px",
                              border: "none",
                              cursor: "pointer",
                              background: "seagreen",
                              color: "white",
                            }}
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {showReports && (
          <div>
            <h2>Listing Reports</h2>
            {loadingReports && <p>Loading reports...</p>}
            {!loadingReports && reports.length === 0 && <p>No reports yet.</p>}
            {!loadingReports && reports.length > 0 && (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: "10px",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                      House ID
                    </th>
                    <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                      Reason
                    </th>
                    <th style={{ borderBottom: "1px solid #ddd", padding: "8px" }}>
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r._id}>
                      <td
                        style={{
                          borderBottom: "1px solid #f0f0f0",
                          padding: "8px",
                        }}
                      >
                        {r.houseId}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #f0f0f0",
                          padding: "8px",
                          maxWidth: "420px",
                          wordBreak: "break-word",
                        }}
                      >
                        {r.reason}
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #f0f0f0",
                          padding: "8px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
