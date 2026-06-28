import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import VerifiedBadge from "../components/VerifiedBadge";
import { getHouseImage } from "../utils/helpers";

const SavedHouses = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await api.get("/favourites");
        setHouses(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading saved homes...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl">Saved homes</h1>
        <p className="mb-8 text-sm text-slate-600">Listings you have saved for later.</p>

        {houses.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="text-slate-600">No saved listings yet.</p>
            <button
              type="button"
              onClick={() => navigate("/houses")}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Browse listings
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {houses.map((house) => (
              <button
                key={house._id}
                type="button"
                onClick={() => navigate(`/houses/${house._id}`)}
                className="overflow-hidden rounded-xl bg-white text-left shadow-md transition hover:shadow-xl"
              >
                <div className="h-48 bg-slate-100">
                  {getHouseImage(house) && (
                    <img src={getHouseImage(house)} alt={house.location} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="p-4">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{house.location}</h3>
                    {house.isVerified && <VerifiedBadge />}
                  </div>
                  <p className="text-sm font-semibold text-blue-700">
                    ₦{Number(house.price).toLocaleString()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedHouses;
