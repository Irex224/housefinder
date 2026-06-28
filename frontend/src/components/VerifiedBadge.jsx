import React from "react";

const VerifiedBadge = ({ className = "" }) => (
  <span
    className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800 sm:text-xs ${className}`}
  >
    ✔ Verified
  </span>
);

export default VerifiedBadge;
