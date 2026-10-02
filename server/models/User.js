const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    college: { type: mongoose.Schema.Types.ObjectId, ref: "College", required: true },
    branch: { type: String, required: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    role: { type: String, enum: ["student", "moderator", "admin"], default: "student" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);