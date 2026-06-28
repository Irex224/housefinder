import React, { useEffect, useState } from "react";
import api from "../api";

const SaveButton = ({ houseId, className = "" }) => {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token || !houseId) return;

    const checkSaved = async () => {
      try {
        const res = await api.get("/favourites/ids");
        setSaved(res.data.includes(houseId));
      } catch {
        setSaved(false);
      }
    };

    checkSaved();
  }, [houseId, token]);

  if (!token) return null;

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    try {
      if (saved) {
        await api.delete(`/favourites/${houseId}`);
        setSaved(false);
      } else {
        await api.post(`/favourites/${houseId}`);
        setSaved(true);
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? "Remove from favourites" : "Save to favourites"}
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        saved
          ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      } disabled:opacity-60 ${className}`}
    >
      {saved ? "♥ Saved" : "♡ Save"}
    </button>
  );
};

export default SaveButton;
