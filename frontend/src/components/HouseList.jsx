import React from "react";
import VerifiedBadge from "./VerifiedBadge";
import { getHouseImage } from "../utils/helpers";

const HouseList = ({ houses, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {houses.map((house) => (
        <div
          key={house._id}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="relative h-44 bg-slate-100">
            {getHouseImage(house) ? (
              <img
                src={getHouseImage(house)}
                alt={house.location || "house"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No image
              </div>
            )}
          </div>

          <div className="p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-slate-900">{house.location}</h3>
              {house.isVerified && <VerifiedBadge />}
            </div>
            <p className="text-sm text-slate-600">
              {house.bedrooms} bed · ₦{Number(house.price).toLocaleString()}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onEdit(house)}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(house._id)}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HouseList;
