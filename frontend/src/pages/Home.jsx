import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import VerifiedBadge from "../components/VerifiedBadge";
import { buildSearchParams, getHouseImage } from "../utils/helpers";

const Home = () => {
  const navigate = useNavigate();

  const [searchLocation, setSearchLocation] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedHouses = async () => {
      try {
        const res = await api.get("/houses");
        setHouses(res.data || []);
      } catch (err) {
        console.error("Error fetching featured houses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedHouses();
  }, []);

  const handleBrowseClick = () => {
    const params = buildSearchParams({
      location: searchLocation,
      maxPrice,
      bedrooms,
    });
    const query = params.toString();
    navigate(query ? `/houses?${query}` : "/houses");
  };

  const featuredHouses = houses.slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="px-4 py-10 md:py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-center">
          <div className="flex-1">
            <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
              Find your next home
            </h1>
            <p className="mb-6 text-sm text-slate-600 md:text-base">
              Discover curated rentals across top locations. Search by area,
              budget, and bedrooms — works great on mobile too.
            </p>

            <div className="space-y-3 rounded-2xl bg-white p-4 shadow-md md:flex md:items-end md:gap-4 md:space-y-0">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lagos, Abuja"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Max price
                </label>
                <input
                  type="number"
                  placeholder="₦ 500,000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Bedrooms
                </label>
                <input
                  type="number"
                  placeholder="2+"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={handleBrowseClick}
                className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 md:w-auto"
              >
                Search
              </button>
            </div>
          </div>

          <div className="flex-1">
            <div className="relative h-56 overflow-hidden rounded-3xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 shadow-lg md:h-72">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.2)_0,transparent_60%),radial-gradient(circle_at_80%_0,rgba(255,255,255,0.25)_0,transparent_55%)]" />
              <div className="relative z-10 flex h-full flex-col justify-between p-6 text-white">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">
                    HouseFinder
                  </p>
                  <h2 className="mt-2 text-xl font-bold leading-snug md:text-2xl">
                    Verified agents. Safer rentals.
                  </h2>
                </div>
                <p className="text-xs leading-relaxed opacity-90">
                  Secure listings, verified agents, and a smooth experience from
                  discovery to move-in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 md:text-2xl">
                Featured listings
              </h2>
              <p className="text-sm text-slate-600">
                Explore homes currently available on HouseFinder.
              </p>
            </div>
            <button
              type="button"
              onClick={handleBrowseClick}
              className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-blue-500 hover:text-blue-600"
            >
              View all
            </button>
          </div>

          {loading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <p className="text-sm font-medium text-slate-600">
                Loading featured homes...
              </p>
            </div>
          ) : featuredHouses.length === 0 ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <p className="text-sm font-medium text-slate-600">
                No listings yet. Check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredHouses.map((house) => (
                <button
                  key={house._id}
                  type="button"
                  onClick={() => navigate(`/houses/${house._id}`)}
                  className="group flex h-full flex-col overflow-hidden rounded-xl bg-white text-left shadow-md ring-1 ring-slate-100 transition hover:shadow-xl"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
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
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
