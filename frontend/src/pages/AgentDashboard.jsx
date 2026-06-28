import React, { useEffect, useState } from "react";
import api from "../api";
import HouseList from "../components/HouseList";
import { getStoredUser, roleLabel } from "../utils/helpers";

const TABS = [
  { id: "listings", label: "My Listings" },
  { id: "inquiries", label: "Inquiries" },
];

const AgentDashboard = () => {
  const user = getStoredUser();
  const [activeTab, setActiveTab] = useState("listings");
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
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
  }, []);

  const fetchHouses = async () => {
    try {
      const res = await api.get("/houses", { params: { mine: "true" } });
      setHouses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInquiries = async () => {
    setLoadingInquiries(true);
    try {
      const res = await api.get("/inquiries");
      setInquiries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInquiries(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === "inquiries") fetchInquiries();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      alert(err.response?.data?.message || err.response?.data?.error || "Failed to save.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await api.delete(`/houses/${id}`);
      fetchHouses();
    } catch (err) {
      alert("Failed to delete listing.");
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

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
            {roleLabel(user)}
          </p>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Agent panel</h1>
          <p className="text-sm text-slate-600">
            Upload and manage your listings. Inquiries for your properties appear here.
          </p>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {TABS.map((tab) => (
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

        {activeTab === "listings" && (
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
              <h2 className="mb-4 text-lg font-semibold">
                {editingHouseId ? "Edit listing" : "Upload new listing"}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input name="location" placeholder="Location" value={formData.location} onChange={handleChange} required className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
                <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
                <input type="number" name="bedrooms" placeholder="Bedrooms" value={formData.bedrooms} onChange={handleChange} required className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="text-sm" />
                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} rows={3} className="sm:col-span-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
              </div>
              <button type="submit" className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                {editingHouseId ? "Update" : "Upload"}
              </button>
            </form>
            {loading ? (
              <p className="text-sm text-slate-600">Loading...</p>
            ) : houses.length === 0 ? (
              <p className="text-sm text-slate-600">No listings yet.</p>
            ) : (
              <HouseList houses={houses} onEdit={handleEdit} onDelete={handleDelete} />
            )}
          </div>
        )}

        {activeTab === "inquiries" && (
          <div className="space-y-3">
            {loadingInquiries && <p className="text-sm text-slate-600">Loading...</p>}
            {!loadingInquiries && inquiries.length === 0 && (
              <p className="rounded-xl bg-white p-6 text-sm text-slate-600 shadow-sm">No inquiries yet.</p>
            )}
            {inquiries.map((inq) => (
              <div key={inq._id} className="rounded-xl bg-white p-4 shadow-sm">
                <p className="font-semibold text-slate-900">{inq.name}</p>
                <p className="text-sm text-blue-600">{inq.email}</p>
                <p className="mt-2 text-sm text-slate-600">{inq.message}</p>
                <p className="mt-2 text-xs text-slate-400">
                  Re: {inq.houseId?.location || inq.houseId}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
