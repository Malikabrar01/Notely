const mongoose = require("mongoose");
require("dotenv").config();
const College = require("../models/College");

const colleges = [
  { name: "NIT Srinagar", city: "Srinagar", state: "Jammu and Kashmir" },
  { name: "University of Kashmir", city: "Srinagar", state: "Jammu and Kashmir" },
  { name: "Islamic University of Science and Technology", city: "Awantipora", state: "Jammu and Kashmir" },
  { name: "Other", city: "", state: "" },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  for (const c of colleges) {
    await College.updateOne({ name: c.name }, c, { upsert: true });
  }
  console.log("Colleges seeded");
  process.exit(0);
})();