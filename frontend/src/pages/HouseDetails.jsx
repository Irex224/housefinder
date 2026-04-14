import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";

const HouseDetails = () => {
  const { id } = useParams();
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [inquirySent, setInquirySent] = useState(false);

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

      alert("Message sent successfully");
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

  return (
    <div className="bg-slate-50 px-4 py-8">
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
            <div className="relative h-64 w-full overflow-hidden rounded-xl bg-slate-100 md:h-96">
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

          <div className="p-5 md:p-6">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 className="mb-2 text-2xl font-bold text-slate-900 md:text-3xl">
                {house.location}
              </h1>
              {house.isVerified && (
                <span
                  style={{
                    background: "green",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    marginLeft: "10px",
                  }}
                >
                  ✔ Verified Agent
                </span>
              )}
            </div>
            <p className="mb-1 text-sm text-slate-600">
              Bedrooms: <span className="font-semibold">{house.bedrooms}</span>
            </p>
            <p className="mb-5 text-lg font-semibold text-blue-700">
              ₦{Number(house.price).toLocaleString()}
            </p>

            <section className="mb-8">
              <h2 className="mb-2 text-lg font-semibold text-slate-900">
                Description
              </h2>
              {house.description ? (
                <p className="text-sm leading-relaxed text-slate-600">
                  {house.description}
                </p>
              ) : (
                <p className="text-sm leading-relaxed text-slate-600">
                  No description provided.
                </p>
              )}
            </section>

            <button
              type="button"
              onClick={async () => {
                const reason = prompt(
                  "Why are you reporting this listing?"
                );
                if (!reason) return;

                try {
                  await api.post("/reports", {
                    houseId: house._id,
                    reason,
                  });
                  alert("Report submitted. Thank you.");
                } catch (err) {
                  console.error("Error submitting report:", err);
                  alert("Failed to submit report. Please try again.");
                }
              }}
              style={{
                background: "red",
                color: "white",
                padding: "8px",
                border: "none",
                borderRadius: "5px",
                marginTop: "10px",
              }}
            >
              🚨 Report Listing
            </button>

            <div
              style={{
                background: "#fff3cd",
                color: "#856404",
                padding: "12px",
                borderRadius: "8px",
                margin: "15px 0",
              }}
            >
              ⚠️ Do NOT make payment without informing HouseFinder. Always
              verify listings and beware of fraud.
            </div>

            <section className="border-t border-slate-100 pt-6">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">
                Contact Landlord
              </h2>
              <p className="mb-4 text-sm text-slate-600">
                Send a message to the landlord to ask questions or schedule a
                viewing.
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
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
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
    </div>
  );
};

export default HouseDetails;
