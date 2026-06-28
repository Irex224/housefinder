const User = require("../models/User");
const { SUPER_ADMIN_EMAIL } = require("../utils/roles");

async function bootstrapSuperAdmin() {
  try {
    const user = await User.findOne({ email: SUPER_ADMIN_EMAIL });
    if (!user) {
      console.log(
        `ℹ️ Super admin email (${SUPER_ADMIN_EMAIL}) not registered yet — sign up first, then restart server.`
      );
      return;
    }

    if (user.role !== "superadmin") {
      user.role = "superadmin";
      await user.save();
      console.log(`✅ Promoted ${SUPER_ADMIN_EMAIL} to superadmin`);
    } else {
      console.log(`✅ Super admin ready: ${SUPER_ADMIN_EMAIL}`);
    }
  } catch (err) {
    console.error("Super admin bootstrap error:", err);
  }
}

module.exports = bootstrapSuperAdmin;
