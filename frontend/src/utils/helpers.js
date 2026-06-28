export function getHouseImage(house) {
  if (house?.images?.length) return house.images[0];
  if (house?.image) return house.image;
  return "";
}

export function buildSearchParams({ location, maxPrice, bedrooms }) {
  const params = new URLSearchParams();
  if (location) params.set("location", location);
  if (maxPrice) params.set("maxPrice", maxPrice);
  if (bedrooms) params.set("bedrooms", bedrooms);
  return params;
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function isSuperAdmin(user) {
  return user?.role === "superadmin";
}

export function isModerator(user) {
  return user?.role === "moderator";
}

export function isAdmin(user) {
  return isSuperAdmin(user) || isModerator(user);
}

export function isAgent(user) {
  return user?.role === "agent";
}

export function isVerifiedAgent(user) {
  return isAgent(user) && user.isVerifiedAgent && !user.isSuspended;
}

export function roleLabel(user) {
  if (!user) return "";
  if (isSuperAdmin(user)) return "Super Admin";
  if (isModerator(user)) return "Admin";
  if (isVerifiedAgent(user)) return "Verified Agent";
  if (isAgent(user)) return "Agent (pending)";
  return "User";
}

export function redirectAfterAuth(user, navigate) {
  if (isAdmin(user)) {
    navigate("/dashboard");
  } else if (isVerifiedAgent(user)) {
    navigate("/agent");
  } else {
    navigate("/");
  }
}

export function canAccessDashboard(user) {
  return isAdmin(user);
}

export function canAccessAgentPanel(user) {
  return isVerifiedAgent(user);
}
