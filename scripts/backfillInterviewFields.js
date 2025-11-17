import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "../server/src/models/User.js";
import Interviewee from "../server/src/models/Interviewee.js";

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not found in environment. Set it in .env or pass it into the environment.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("Connected to MongoDB");

  try {
    const res1 = await User.updateMany(
      { interviewsGiven: { $exists: false } },
      { $set: { interviewsGiven: 0 } }
    );
    console.log("Users interviewsGiven update:", res1.matchedCount ?? res1.n, "matched", res1.modifiedCount ?? res1.nModified, "modified");

    const res2 = await User.updateMany(
      { interviewsTaken: { $exists: false } },
      { $set: { interviewsTaken: 0 } }
    );
    console.log("Users interviewsTaken update:", res2.matchedCount ?? res2.n, "matched", res2.modifiedCount ?? res2.nModified, "modified");

    const res3 = await Interviewee.updateMany(
      { interviewsTaken: { $exists: false } },
      { $set: { interviewsTaken: 0, ratingSum: 0 } }
    );
    console.log("Interviewees update:", res3.matchedCount ?? res3.n, "matched", res3.modifiedCount ?? res3.nModified, "modified");

  } catch (err) {
    console.error("Backfill failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected");
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
