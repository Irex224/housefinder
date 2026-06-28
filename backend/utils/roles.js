const SUPER_ADMIN_EMAIL = (
  process.env.SUPER_ADMIN_EMAIL || "thugforsign@gmail.com"
).toLowerCase();

const ROLES = {
  USER: "user",
  AGENT: "agent",
  ADMIN: "moderator",
  SUPERADMIN: "superadmin",
};

const ADMIN_ROLES = [ROLES.ADMIN, ROLES.SUPERADMIN];

const isSuperAdmin = (user) => user?.role === ROLES.SUPERADMIN;
const isAdmin = (user) => ADMIN_ROLES.includes(user?.role);
const isAgent = (user) => user?.role === ROLES.AGENT;
const isVerifiedAgent = (user) =>
  isAgent(user) && user.isVerifiedAgent && !user.isSuspended;

const canManageAnyListing = (user) => isAdmin(user);

const canManageListing = (user, house) => {
  if (!user || user.isBanned) return false;
  if (canManageAnyListing(user)) return true;
  if (
    isVerifiedAgent(user) &&
    house.agentId &&
    house.agentId.toString() === user._id.toString()
  ) {
    return true;
  }
  return false;
};

const canUploadListing = (user) => {
  if (!user || user.isBanned) return false;
  if (isAdmin(user)) return true;
  return isVerifiedAgent(user);
};

module.exports = {
  SUPER_ADMIN_EMAIL,
  ROLES,
  ADMIN_ROLES,
  isSuperAdmin,
  isAdmin,
  isAgent,
  isVerifiedAgent,
  canManageAnyListing,
  canManageListing,
  canUploadListing,
};
