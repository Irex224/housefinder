const mongoose = require("mongoose");

function getMongoUri() {
  return process.env.MONGO_URI || process.env.MONGODB_URI || null;
}

function extractMongoHost(uri) {
  if (!uri) return null;

  const srvMatch = uri.match(/mongodb\+srv:\/\/(?:[^@]+@)?([^/?]+)/i);
  if (srvMatch) return srvMatch[1];

  const stdMatch = uri.match(/mongodb:\/\/(?:[^@]+@)?([^/?]+)/i);
  if (stdMatch) return stdMatch[1].split(",")[0];

  return null;
}

function logMongoDiagnostics(uri) {
  console.log("[MongoDB] MONGO_URI set:", Boolean(process.env.MONGO_URI));
  console.log("[MongoDB] MONGODB_URI set:", Boolean(process.env.MONGODB_URI));

  if (!uri) {
    console.error(
      "[MongoDB] No connection string found. Set MONGO_URI or MONGODB_URI in backend/.env"
    );
    return;
  }

  const host = extractMongoHost(uri);
  const isSrv = uri.startsWith("mongodb+srv://");

  console.log("[MongoDB] Connection string loaded: yes");
  console.log("[MongoDB] Hostname:", host || "could not parse");
  console.log(
    "[MongoDB] Connection type:",
    isSrv
      ? "mongodb+srv (requires DNS SRV lookup)"
      : "mongodb (standard, no SRV lookup)"
  );

  if (isSrv) {
    console.log(
      "[MongoDB] Tip: if you see querySrv ECONNREFUSED, your DNS cannot resolve SRV records."
    );
    console.log(
      "[MongoDB] Fix: use Google DNS (8.8.8.8) or switch to the standard mongodb:// URI from Atlas."
    );
  }
}

async function connectDatabase() {
  const uri = getMongoUri();
  logMongoDiagnostics(uri);

  if (!uri) {
    throw new Error("Missing MONGO_URI or MONGODB_URI environment variable");
  }

  mongoose.set("bufferCommands", false);

  mongoose.connection.on("connected", () => {
    console.log(
      "[MongoDB] Mongoose connected — readyState:",
      mongoose.connection.readyState
    );
  });

  mongoose.connection.on("error", (err) => {
    console.error("[MongoDB] Connection error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.log(
      "[MongoDB] Disconnected — readyState:",
      mongoose.connection.readyState
    );
  });

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ Connected to MongoDB Atlas");
    console.log(
      "[MongoDB] Final readyState:",
      mongoose.connection.readyState,
      "(1 = connected)"
    );
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);

    if (err.message?.includes("querySrv") || err.code === "ECONNREFUSED") {
      console.error(
        "[MongoDB] This is a DNS/network issue resolving the Atlas SRV hostname."
      );
      console.error(
        "[MongoDB] Your Atlas cluster appears valid — SRV lookup works on public DNS (8.8.8.8)."
      );
      console.error(
        "[MongoDB] Actions: (1) Change your DNS to 8.8.8.8 / 1.1.1.1, or"
      );
      console.error(
        "[MongoDB] (2) In Atlas → Connect → Drivers, copy the standard mongodb:// connection string"
      );
      console.error(
        "[MongoDB]     and replace MONGO_URI in .env (bypasses SRV lookup)."
      );
    }

    throw err;
  }
}

function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connectDatabase,
  isDatabaseConnected,
  getMongoUri,
  extractMongoHost,
};
