import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import ReportModal from "../components/ReportModal";
import SaveButton from "../components/SaveButton";
import TrustBanner from "../components/TrustBanner";
import VerifiedBadge from "../components/VerifiedBadge";

const HouseDetails = () => {
  const { id } = useParams();
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [inquirySent, setInquirySent] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHouse = async () => {
      try {
        const res = await api.get(`/houses/${id}`);
        setHouse(res.data);
        setActiveImageIndex(0);
      } catch (err) {
        console.error("Error fetching house:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHouse();
  }, [id]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/inquiries", {
        houseId: house._id,
        name,
        email,
        message,
      });

      setInquirySent(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error("Error sending inquiry:", err);
      setInquirySent(false);
      alert("Failed to send inquiry. Please try again.");
    }
  };

  const handleReport = async (reason) => {
    await api.post("/reports", { houseId: house._id, reason });
    setReportSuccess(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <h2 className="text-lg font-medium text-slate-700">
          Loading listing details...
        </h2>
      </div>
    );
  }

  if (!house) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <h2 className="text-lg font-medium text-slate-700">
          House not found.
        </h2>
      </div>
    );
  }

  const images =
    (house.images && house.images.length > 0
      ? house.images
      : house.image
      ? [house.image]
      : []) || [];

  const mainImage = images[activeImageIndex] || images[0] || "";
  const agent = house.agentId;

  return (
    <div className="bg-slate-50 px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate("/houses")}
          className="mb-4 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to listings
        </button>

        <div className="overflow-hidden rounded-2xl bg-white shadow-md">
          <div className="p-4 pb-0 md:p-6 md:pb-0">
            <div className="relative h-56 w-full overflow-hidden rounded-xl bg-slate-100 sm:h-72 md:h-96">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={house.location || "house"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                  No images available
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((img, index) => (
                  <button
                    key={img + index}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border ${
                      index === activeImageIndex
                        ? "border-blue-600 ring-2 ring-blue-200"
                        : "border-slate-200"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5 p-5 md:p-6">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                  {house.location}
                </h1>
                {house.isVerified && <VerifiedBadge />}
              </div>
              <p className="text-sm text-slate-600">
                {house.bedrooms} bedroom
                {Number(house.bedrooms) > 1 ? "s" : ""}
              </p>
              <p className="mt-1 text-xl font-semibold text-blue-700">
                ₦{Number(house.price).toLocaleString()}
              </p>
              <div className="mt-3">
                <SaveButton houseId={house._id} />
              </div>
            </div>

            {agent && typeof agent === "object" && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Listed by
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="font-medium text-slate-900">{agent.name}</span>
                  {agent.isVerifiedAgent && <VerifiedBadge />}
                </div>
                {agent.area && (
                  <p className="mt-1 text-xs text-slate-600">Area: {agent.area}</p>
                )}
              </div>
            )}

            <section>
              <h2 className="mb-2 text-lg font-semibold text-slate-900">
                Description
              </h2>
              <p className="text-sm leading-relaxed text-slate-600">
                {house.description || "No description provided."}
              </p>
            </section>

            <TrustBanner />

            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 sm:w-auto"
            >
              Report this listing
            </button>

            {reportSuccess && (
              <p className="text-sm font-medium text-green-600">
                Report submitted. Thank you for helping keep HouseFinder safe.
              </p>
            )}

            <section className="border-t border-slate-100 pt-6">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">
                Contact landlord
              </h2>
              <p className="mb-4 text-sm text-slate-600">
                Send a message to ask questions or schedule a viewing.
              </p>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={4}
                    placeholder="I'm interested in this property. Please contact me."
                    className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 sm:w-auto"
                >
                  Send inquiry
                </button>

                {inquirySent && (
                  <p className="text-sm font-medium text-green-600">
                    Your inquiry has been sent.
                  </p>
                )}
              </form>
            </section>
          </div>
        </div>
      </div>

      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={handleReport}
      />
    </div>
  );
};

export default HouseDetails;
