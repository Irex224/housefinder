import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const Houses = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
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

    fetchHouses();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <h2 className="text-lg font-medium text-slate-700">
          Loading listings...
        </h2>
      </div>
    );
  }

  if (!loading && houses.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <h2 className="text-lg font-medium text-slate-700">
          🏠 No houses available yet.
        </h2>
      </div>
    );
  }

  const filteredHouses = houses.filter((house) => {
    const matchesLocation =
      !searchLocation ||
      (house.location || "")
        .toLowerCase()
        .includes(searchLocation.toLowerCase());

    const matchesMaxPrice =
      !maxPrice || Number(house.price) <= Number(maxPrice);

    const matchesBedrooms =
      !bedrooms || Number(house.bedrooms) >= Number(bedrooms);

    return matchesLocation && matchesMaxPrice && matchesBedrooms;
  });

  const handleCardClick = (id) => {
    navigate(`/houses/${id}`);
  };

  return (
    <div className="bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Hero + search */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold text-slate-900 md:text-4xl">
            Find your next home
          </h1>
          <p className="mb-6 text-sm text-slate-600 md:text-base">
            Browse curated listings and use filters to discover places that fit
            your budget and lifestyle.
          </p>

          <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-center md:gap-4">
            <input
              type="text"
              placeholder="Location"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 md:max-w-xs"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 md:max-w-xs"
            />
            <input
              type="number"
              placeholder="Bedrooms"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 md:max-w-xs"
            />
          </div>
        </div>

        {filteredHouses.length === 0 ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <h3 className="mb-1 text-lg font-semibold text-slate-800">
                🏠 No houses match your search.
              </h3>
              <p className="text-sm text-slate-600">
                Try adjusting your filters.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredHouses.map((house) => (
              <button
                key={house._id}
                type="button"
                onClick={() => handleCardClick(house._id)}
                className="group flex h-full flex-col overflow-hidden rounded-xl bg-white text-left shadow-md transition-transform transition-shadow duration-200 hover:scale-[1.02] hover:shadow-xl"
              >
                <div className="relative h-52 w-full overflow-hidden">
                  <img
                    src={
                      (house.images && house.images[0]) || house.image || ""
                    }
                    alt={house.location || "house"}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900">
                      {house.location}
                    </h3>
                    {house.isVerified && (
                      <span
                        style={{
                          background: "green",
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "6px",
                        }}
                      >
                        ✔ Verified Agent
                      </span>
                    )}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Houses;
