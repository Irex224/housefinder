import React from "react";

const TrustBanner = () => (
  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
    <p className="font-semibold">Stay safe on HouseFinder</p>
    <p className="mt-1 text-xs leading-relaxed text-amber-800 sm:text-sm">
      Do not make payment without verifying the listing. Look for the verified
      badge and report suspicious listings immediately.
    </p>
  </div>
);

export default TrustBanner;
