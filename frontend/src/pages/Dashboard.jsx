import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import HouseList from "../components/HouseList";
import {
  getStoredUser,
  isSuperAdmin,
  roleLabel,
} from "../utils/helpers";

const MOD_TABS = [
  { id: "listings", label: "Listings" },
  { id: "inquiries", label: "Inquiries" },
  { id: "agents", label: "Applications" },
  { id: "reports", label: "Reports" },
];

const SUPER_TABS = [
  { id: "analytics", label: "Analytics" },
  ...MOD_TABS,
  { id: "users", label: "Users" },
  { id: "admins", label: "Admins" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getStoredUser();
  const superAdmin = isSuperAdmin(user);
  const tabs = superAdmin ? SUPER_TABS : MOD_TABS;

  const [activeTab, setActiveTab] = useState(superAdmin ? "analytics" : "listings");
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agentApplications, setAgentApplications] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [editingHouseId, setEditingHouseId] = useState(null);
  const [formData, setFormData] = useState({
    location: "",
    price: "",
    bedrooms: "",
    description: "",
    images: [],
  });

  useEffect(() => {
    fetchHouses();
    if (superAdmin) fetchAnalytics();
  }, []);

  const fetchHouses = async () => {
    try {
      const res = await api.get("/houses");
      setHouses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await api.get("/agents/applications");
      setAgentApplications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInquiries = async () => {
    try {
      const res = await api.get("/inquiries");
      setInquiries(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await api.get("/reports");
      setReports(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/analytics");
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === "agents") fetchApplications();
    if (tabId === "inquiries") fetchInquiries();
    if (tabId === "reports") fetchReports();
    if (tabId === "users" || tabId === "admins") fetchUsers();
    if (tabId === "analytics") fetchAnalytics();
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({ ...prev, images: e.target.files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("location", formData.location);
    form.append("price", formData.price);
    form.append("bedrooms", formData.bedrooms);
    form.append("description", formData.description);
    if (formData.images?.length) {
      for (let i = 0; i < formData.images.length; i += 1) {
        form.append("images", formData.images[i]);
      }
    }

    try {
      if (editingHouseId) {
        await api.put(`/houses/${editingHouseId}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        if (!formData.images?.length) {
          alert("Please add at least one image.");
          return;
        }
        await api.post("/houses", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setFormData({ location: "", price: "", bedrooms: "", description: "", images: [] });
      setEditingHouseId(null);
      fetchHouses();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save listing.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await api.delete(`/houses/${id}`);
      fetchHouses();
    } catch (err) {
      alert("Failed to delete.");
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
    setActiveTab("listings");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApplicationStatus = async (id, status) => {
    try {
      await api.put(`/agents/${id}/approve`, { status });
      fetchApplications();
      if (superAdmin) fetchAnalytics();
    } catch (err) {
      alert("Failed to update application.");
    }
  };

  const handleBan = async (id) => {
    if (!window.confirm("Ban this user?")) return;
    try {
      await api.put(`/admin/users/${id}/ban`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to ban user.");
    }
  };

  const handleUnban = async (id) => {
    try {
      await api.put(`/admin/users/${id}/unban`);
      fetchUsers();
    } catch (err) {
      alert("Failed to unban user.");
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/admins", { email: adminEmail });
      setAdminEmail("");
      fetchUsers();
      alert("Admin created successfully.");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create admin.");
    }
  };

  const handleRemoveAdmin = async (id) => {
    if (!window.confirm("Remove admin privileges?")) return;
    try {
      await api.delete(`/admin/admins/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to remove admin.");
    }
  };

  const handleSuspendAgent = async (id) => {
    if (!window.confirm("Suspend this agent?")) return;
    try {
      await api.put(`/admin/agents/${id}/suspend`);
      fetchUsers();
    } catch (err) {
      alert("Failed to suspend agent.");
    }
  };

  const handleUnsuspendAgent = async (id) => {
    try {
      await api.put(`/admin/agents/${id}/unsuspend`);
      fetchUsers();
    } catch (err) {
      alert("Failed to unsuspend agent.");
    }
  };

  const statusBadge = (status) => {
    const colors = {
      pending: "bg-amber-100 text-amber-800",
      approved: "bg-emerald-100 text-emerald-800",
      rejected: "bg-red-100 text-red-800",
    };
    return (
      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${colors[status] || "bg-slate-100"}`}>
        {status}
      </span>
    );
  };

  const statCard = (label, value) => (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value ?? "—"}</p>
    </div>
  );

  const admins = users.filter((u) => u.role === "moderator");

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              {roleLabel(user)}
              {superAdmin && user?.email === "thugforsign@gmail.com" && " (You)"}
            </p>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Dashboard</h1>
            <p className="text-sm text-slate-600">
              {superAdmin
                ? "Full platform control — users, admins, analytics, and more."
                : "Manage listings, inquiries, agent applications, and reports."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
          >
            Sign out
          </button>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "analytics" && superAdmin && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {statCard("Users", analytics?.totalUsers)}
            {statCard("Agents", analytics?.totalAgents)}
            {statCard("Verified agents", analytics?.verifiedAgents)}
            {statCard("Listings", analytics?.totalHouses)}
            {statCard("Verified listings", analytics?.verifiedListings)}
            {statCard("Inquiries", analytics?.totalInquiries)}
            {statCard("Reports", analytics?.totalReports)}
            {statCard("Pending applications", analytics?.pendingApplications)}
            {statCard("Admins", analytics?.totalAdmins)}
            {statCard("Banned users", analytics?.bannedUsers)}
            {statCard("Suspended agents", analytics?.suspendedAgents)}
            {statCard("Saved favourites", analytics?.totalSaved)}
          </div>
        )}

        {activeTab === "listings" && (
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
              <h2 className="mb-4 text-lg font-semibold">
                {editingHouseId ? "Edit listing" : "Add listing"}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input name="location" placeholder="Location" value={formData.location} onChange={handleChange} required className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
                <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
                <input type="number" name="bedrooms" placeholder="Bedrooms" value={formData.bedrooms} onChange={handleChange} required className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="text-sm" />
                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} rows={3} className="sm:col-span-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
              </div>
              <button type="submit" className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                {editingHouseId ? "Update" : "Add listing"}
              </button>
            </form>
            {loading ? (
              <p className="text-sm text-slate-600">Loading...</p>
            ) : (
              <HouseList houses={houses} onEdit={handleEdit} onDelete={handleDelete} />
            )}
          </div>
        )}

        {activeTab === "inquiries" && (
          <div className="space-y-3">
            {inquiries.length === 0 && (
              <p className="rounded-xl bg-white p-6 text-sm text-slate-600 shadow-sm">No inquiries yet.</p>
            )}
            {inquiries.map((inq) => (
              <div key={inq._id} className="rounded-xl bg-white p-4 shadow-sm">
                <p className="font-semibold">{inq.name}</p>
                <p className="text-sm text-blue-600">{inq.email}</p>
                <p className="mt-2 text-sm text-slate-600">{inq.message}</p>
                <p className="mt-2 text-xs text-slate-400">
                  Re: {inq.houseId?.location || inq.houseId}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "agents" && (
          <div className="space-y-3">
            {agentApplications.length === 0 && (
              <p className="rounded-xl bg-white p-6 text-sm text-slate-600 shadow-sm">No applications yet.</p>
            )}
            {agentApplications.map((app) => (
              <div key={app._id} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{app.name}</p>
                    <p className="text-sm text-slate-600">{app.email}</p>
                    <p className="text-sm text-slate-600">{app.phone}</p>
                  </div>
                  {statusBadge(app.status)}
                </div>
                {app.area && <p className="mt-2 text-sm">Area: {app.area}</p>}
                {app.experience && <p className="mt-1 text-sm text-slate-600">{app.experience}</p>}
                {app.status === "pending" && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => handleApplicationStatus(app._id, "approved")} className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white">Approve</button>
                    <button type="button" onClick={() => handleApplicationStatus(app._id, "rejected")} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white">Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-3">
            {reports.length === 0 && (
              <p className="rounded-xl bg-white p-6 text-sm text-slate-600 shadow-sm">No reports yet.</p>
            )}
            {reports.map((r) => (
              <div key={r._id} className="rounded-xl bg-white p-4 shadow-sm">
                <p className="font-semibold">{r.houseId?.location || "Unknown listing"}</p>
                <p className="mt-2 text-sm text-slate-600">{r.reason}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "users" && superAdmin && (
          <div className="space-y-3">
            {users.filter((u) => u.role !== "superadmin").map((u) => (
              <div key={u.id} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-sm text-slate-600">{u.email}</p>
                    <p className="mt-1 text-xs capitalize text-slate-500">{u.role}{u.isBanned ? " · banned" : ""}{u.isSuspended ? " · suspended" : ""}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {u.role === "agent" && !u.isSuspended && (
                      <button type="button" onClick={() => handleSuspendAgent(u.id)} className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white">Suspend</button>
                    )}
                    {u.role === "agent" && u.isSuspended && (
                      <button type="button" onClick={() => handleUnsuspendAgent(u.id)} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white">Unsuspend</button>
                    )}
                    {!u.isBanned ? (
                      <button type="button" onClick={() => handleBan(u.id)} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white">Ban</button>
                    ) : (
                      <button type="button" onClick={() => handleUnban(u.id)} className="rounded-lg bg-slate-600 px-3 py-1.5 text-xs font-semibold text-white">Unban</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "admins" && superAdmin && (
          <div className="space-y-6">
            <form onSubmit={handleCreateAdmin} className="rounded-xl bg-white p-4 shadow-sm">
              <h2 className="mb-3 font-semibold">Create admin</h2>
              <p className="mb-3 text-sm text-slate-600">Promote an existing user to admin by email.</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="user@email.com"
                  required
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                />
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                  Add admin
                </button>
              </div>
            </form>
            <div className="space-y-3">
              {admins.length === 0 && (
                <p className="rounded-xl bg-white p-6 text-sm text-slate-600 shadow-sm">No admins yet.</p>
              )}
              {admins.map((a) => (
                <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-4 shadow-sm">
                  <div>
                    <p className="font-semibold">{a.name}</p>
                    <p className="text-sm text-slate-600">{a.email}</p>
                  </div>
                  <button type="button" onClick={() => handleRemoveAdmin(a.id)} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white">
                    Remove admin
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
