const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["paper", "notes", "syllabus"], required: true },
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    year: { type: Number }, // exam year, mainly for papers
    college: { type: mongoose.Schema.Types.ObjectId, ref: "College", required: true },
    branch: { type: String, required: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    fileUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    fileName: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "approved"], default: "approved" },
    reports: [
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reason: { type: String, maxlength: 200 },
    createdAt: { type: Date, default: Date.now },
  },
],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);