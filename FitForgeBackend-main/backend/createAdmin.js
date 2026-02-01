const mongoose = require("mongoose");
const keys = require("./config/keys");
require("./models/User");
const User = mongoose.model("users");

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (const a of args) {
    const m = a.match(/^--([^=]+)=(.+)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

(async () => {
  const { email, login } = parseArgs();
  if (!email && !login) {
    console.error("Usage: node createAdmin.js --email=user@example.com OR --login=username");
    process.exit(1);
  }

  try {
    await mongoose.connect(keys.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    const query = email ? { email } : { login };
    const user = await User.findOne(query);
    if (!user) {
      console.error("User not found:", query);
      process.exit(2);
    }

    if (user.isAdmin) {
      console.log("User is already admin:", email || login);
    } else {
      user.isAdmin = true;
      await user.save();
      console.log("User promoted to admin:", email || login);
    }
  } catch (err) {
    console.error("Error:", err);
    process.exit(3);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
