import dns from "node:dns/promises";
import mongoose from "mongoose";
import Logger from "./../utils/logger.js";

// Don't buffer queries for 10s when disconnected — fail immediately so APIs
// return a clear 503 instead of "Operation ... buffering timed out".
mongoose.set("bufferCommands", false);

const maskUri = (uri) => String(uri || "").replace(/\/\/.*@/, "//***@");

const withTimeout = (promise, ms, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    }),
  ]);

/**
 * When local DNS can't resolve mongodb+srv (queryTxt ETIMEOUT), rebuild a
 * standard mongodb:// URI from SRV host records so Atlas is still reachable.
 */
async function toDirectMongoUri(srvUri) {
  const match = String(srvUri).match(
    /^mongodb\+srv:\/\/([^@]+)@([^/?]+)\/?([^?]*)(\?.*)?$/i
  );
  if (!match) return null;
  const [, auth, host, db = "", query = ""] = match;

  // Prefer public resolvers when the ISP/VPN DNS drops Atlas SRV/TXT lookups.
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch {
    // ignore — setServers can fail in restricted environments
  }

  let hosts = String(process.env.MONGO_DIRECT_HOSTS || "").trim();
  if (!hosts) {
    try {
      const records = await withTimeout(
        dns.resolveSrv(`_mongodb._tcp.${host}`),
        8000,
        "resolveSrv"
      );
      if (!records?.length) return null;
      hosts = records
        .map((row) => `${row.name}:${row.port || 27017}`)
        .join(",");
    } catch {
      return null;
    }
  }

  let authSource = "admin";
  let replicaSet = "";
  try {
    const txt = (
      await withTimeout(dns.resolveTxt(host), 4000, "resolveTxt")
    )
      .flat()
      .join("");
    const rs = /replicaSet=([^&]+)/i.exec(txt);
    const as = /authSource=([^&]+)/i.exec(txt);
    if (rs) replicaSet = rs[1];
    if (as) authSource = as[1];
  } catch {
    // TXT often fails on the same broken resolvers; authSource=admin is enough for Atlas.
  }

  const params = new URLSearchParams(
    query.startsWith("?") ? query.slice(1) : query
  );
  params.set("tls", "true");
  if (!params.has("authSource")) params.set("authSource", authSource);
  if (replicaSet && !params.has("replicaSet")) {
    params.set("replicaSet", replicaSet);
  }
  params.delete("ssl");

  return `mongodb://${auth}@${hosts}/${db || "sello_db"}?${params.toString()}`;
}

const connectOptions = {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  maxPoolSize: 20,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  retryWrites: true,
  retryReads: true,
};

const connectDB = async () => {
  const mongoUri =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sello-db";
  const maskedUri = maskUri(mongoUri);

  const attachEvents = () => {
    mongoose.connection.on("error", (err) => {
      Logger.error("MongoDB connection error", err);
    });
    mongoose.connection.on("disconnected", () => {
      Logger.warn("MongoDB disconnected");
    });
    mongoose.connection.on("reconnected", () => {
      Logger.info("MongoDB reconnected");
    });
  };

  // Prefer direct shard hosts when configured — avoids hanging on broken SRV/TXT DNS.
  if (
    /^mongodb\+srv:/i.test(mongoUri) &&
    String(process.env.MONGO_DIRECT_HOSTS || "").trim()
  ) {
    try {
      const directUri = await toDirectMongoUri(mongoUri);
      if (directUri) {
        console.log("💡 Connecting via MONGO_DIRECT_HOSTS:", maskUri(directUri));
        await mongoose.connect(directUri, connectOptions);
        Logger.info("MongoDb Connected Successfully (direct hosts)...");
        console.log("✅ MongoDB connected (direct hosts)");
        attachEvents();
        return;
      }
    } catch (directError) {
      console.error(
        "❌ MongoDB direct hosts failed, falling back to MONGO_URI:",
        directError.message
      );
    }
  }

  try {
    await mongoose.connect(mongoUri, connectOptions);
    Logger.info("MongoDb Connected Successfully...");
    console.log("✅ MongoDB connected");
    attachEvents();
    return;
  } catch (error) {
    const dnsFailure = /queryTxt|ETIMEOUT|ENOTFOUND|EAI_AGAIN|querySrv/i.test(
      error.message || ""
    );
    if (dnsFailure && /^mongodb\+srv:/i.test(mongoUri)) {
      console.error("❌ MongoDB SRV/DNS failed:", error.message);
      try {
        const directUri = await toDirectMongoUri(mongoUri);
        if (directUri) {
          console.log(
            "💡 Retrying Atlas with direct shard hosts:",
            maskUri(directUri)
          );
          await mongoose.connect(directUri, connectOptions);
          Logger.info("MongoDb Connected Successfully (direct hosts)...");
          console.log("✅ MongoDB connected (direct hosts)");
          attachEvents();
          return;
        }
        console.error(
          "💡 Could not resolve Atlas shard hosts. Set MONGO_DIRECT_HOSTS=host1:27017,host2:27017,host3:27017 or use a standard mongodb:// URI from Atlas."
        );
      } catch (retryError) {
        Logger.error("Failed to connect to MongoDB via direct hosts", retryError, {
          mongoUri: maskedUri,
        });
        console.error("❌ MongoDB direct connect failed:", retryError.message);
        return;
      }
    }

    Logger.error("Failed to connect to MongoDB", error, { mongoUri: maskedUri });
    console.error("❌ MongoDB connection failed:", error.message);
    if (dnsFailure) {
      console.error(
        "💡 Atlas DNS lookup failed. Check internet/VPN/DNS, or set MONGO_URI to a standard mongodb:// connection string from Atlas."
      );
    }
  }
};

export default connectDB;
