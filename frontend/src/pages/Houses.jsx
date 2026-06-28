import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";
import VerifiedBadge from "../components/VerifiedBadge";
import SaveButton from "../components/SaveButton";
import { getHouseImage } from "../utils/helpers";

const Houses = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    setSearchLocation(searchParams.get("location") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setBedrooms(searchParams.get("bedrooms") || "");
  }, [searchParams]);

  useEffect(() => {
    const fetchHouses = async () => {
      setLoading(true);
      try {
        const params = {};
        const loc = searchParams.get("location");
        const price = searchParams.get("maxPrice");
        const beds = searchParams.get("bedrooms");
        if (loc) params.location = loc;
        if (price) params.maxPrice = price;
        if (beds) params.bedrooms = beds;

        const res = await api.get("/houses", { params });
        setHouses(res.data);
      } catch (err) {
        console.error("Error fetching houses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHouses();
  }, [searchParams]);

  const applyFilters = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchLocation) params.set("location", searchLocation);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (bedrooms) params.set("bedrooms", bedrooms);
    const query = params.toString();
    navigate(query ? `/houses?${query}` : "/houses");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <h2 className="text-lg font-medium text-slate-700">
          Loading listings...
        </h2>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">
            Browse listings
          </h1>
          <p className="mb-6 text-sm text-slate-600 sm:text-base">
            Filter by location, price, and bedrooms to find your match.
          </p>

          <form
            onSubmit={applyFilters}
            className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end"
          >
            <div className="flex-1 sm:min-w-[140px]">
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Location
              </label>
              <input
                type="text"
                placeholder="Location"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 sm:min-w-[120px]">
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Max price
              </label>
              <input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 sm:min-w-[100px]">
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Bedrooms
              </label>
              <input
                type="number"
                placeholder="Bedrooms"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Apply filters
            </button>
          </form>
        </div>

        {!loading && houses.length === 0 ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <h3 className="mb-1 text-lg font-semibold text-slate-800">
                No houses match your search
              </h3>
              <p className="text-sm text-slate-600">
                Try adjusting your filters.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {houses.map((house) => (
              <div
                key={house._id}
                className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-md transition hover:shadow-xl"
              >
                <div className="absolute right-3 top-3 z-10">
                  <SaveButton houseId={house._id} />
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/houses/${house._id}`)}
                  className="flex h-full flex-col text-left"
                >
                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                  {getHouseImage(house) ? (
                    <img
                      src={getHouseImage(house)}
                      alt={house.location || "house"}
                      className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900">
                      {house.location}
                    </h3>
                    {house.isVerified && <VerifiedBadge />}
                  </div>
                  <p className="mb-1 text-sm text-slate-600">
                    {house.bedrooms} bedroom
                    {Number(house.bedrooms) > 1 ? "s" : ""}
                  </p>
                  <p className="mt-auto text-sm font-semibold text-blue-700">
                    ₦{Number(house.price).toLocaleString()}
                  </p>
                </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Houses;
