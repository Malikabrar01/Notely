const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("College", collegeSchema);