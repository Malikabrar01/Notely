const mongoose = require("mongoose");
const escapeRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const Resource = require("../models/Resources");
const auth = require("../middleware/auth");

const router = express.Router();

/* ---------- Upload setup ---------- */

const ALLOWED = ["application/pdf", "image/jpeg", "image/png"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) =>
    ALLOWED.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only PDF, JPG or PNG files are allowed")),
});

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "notely", resource_type: "auto" }, (err, result) =>
        err ? reject(err) : resolve(result)
      )
      .end(buffer);
  });

/* ---------- Helpers ---------- */

const staffOnly = (req, res, next) =>
  ["moderator", "admin"].includes(req.user.role)
    ? next()
    : res.status(403).json({ message: "Staff only" });

/* ---------- POST /api/resources  (upload) ---------- */

router.post(
  "/",
  auth,
  (req, res, next) =>
    upload.single("file")(req, res, (err) =>
      err ? res.status(400).json({ message: err.message }) : next()
    ),
  async (req, res) => {
    try {
      const { type, title, subject, year, branch, semester } = req.body || {};

      if (!req.file) return res.status(400).json({ message: "File is required" });
      if (!type || !title || !subject || !branch || !semester) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const result = await uploadToCloudinary(req.file.buffer);

      const resource = await Resource.create({
        type,
        title,
        subject,
        branch,
        semester: Number(semester),
        year: year ? Number(year) : undefined,
        college: req.user.college, // always the uploader's college
        fileUrl: result.secure_url,
        publicId: result.public_id,
        fileName: req.file.originalname,
        uploadedBy: req.user.id,
      });

      res.status(201).json(resource);
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      res.status(500).json({ message: "Upload failed", error: err.message });
    }
  }
);

/* ---------- GET /api/resources/reported  (staff) ---------- */
/* Must stay above any "/:id" route */

router.get("/reported", auth, staffOnly, async (req, res) => {
  try {
    const items = await Resource.find({
      college: req.user.college,
      "reports.0": { $exists: true },
    })
      .sort("-updatedAt")
      .populate("uploadedBy", "name email");
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ---------- POST /api/resources/:id/report ---------- */

router.post("/:id/report", auth, async (req, res) => {
  try {
    const item = await Resource.findOne({
      _id: req.params.id,
      college: req.user.college,
    });
    if (!item) return res.status(404).json({ message: "Not found" });

    if (item.reports.some((r) => String(r.user) === String(req.user.id))) {
      return res.status(400).json({ message: "You already reported this" });
    }

    item.reports.push({
      user: req.user.id,
      reason: (req.body?.reason || "").slice(0, 200),
    });
    await item.save();

    res.json({ message: "Reported. Thanks for helping." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ---------- POST /api/resources/:id/dismiss  (staff) ---------- */

router.post("/:id/dismiss", auth, staffOnly, async (req, res) => {
  try {
    await Resource.updateOne(
      { _id: req.params.id, college: req.user.college },
      { $set: { reports: [] } }
    );
    res.json({ message: "Dismissed" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
// GET /api/resources/subjects?branch=&semester=
router.get("/subjects", auth, async (req, res) => {
  try {
    const { branch, semester } = req.query;
    const filter = { college: req.user.college, status: "approved" };
    if (branch) filter.branch = branch;
    if (semester) filter.semester = Number(semester);

    const items = await Resource.find(filter).select("subject type").sort("-createdAt");

    const map = new Map();
    for (const it of items) {
      const name = (it.subject || "").trim();
      if (!name) continue;
      const key = name.toLowerCase();
      if (!map.has(key)) {
        map.set(key, { _id: key, name, papers: 0, notes: 0, syllabus: 0, total: 0 });
      }
      const s = map.get(key);
      s.total++;
      if (it.type === "paper") s.papers++;
      else if (it.type === "notes") s.notes++;
      else if (it.type === "syllabus") s.syllabus++;
    }

    res.json([...map.values()].sort((a, b) => a.name.localeCompare(b.name)));
  } catch (err) {
    console.error("SUBJECTS ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ---------- GET /api/resources?type=&branch=&semester=&q= ---------- */

router.get("/", auth, async (req, res) => {
  try {
    const { type, branch, semester, q, subject } = req.query;
    const filter = { college: req.user.college, status: "approved" };

    if (type) filter.type = type;
    if (branch) filter.branch = branch;
    if (semester) filter.semester = Number(semester);

    if (subject) {
      filter.subject = new RegExp(`^\\s*${escapeRx(subject.trim())}\\s*$`, "i");
    }
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ title: rx }, { subject: rx }];
    }

    const items = await Resource.find(filter)
      .select("-reports")
      .sort("-createdAt")
      .populate("uploadedBy", "name");

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ---------- DELETE /api/resources/:id  (owner, moderator or admin) ---------- */

router.delete("/:id", auth, async (req, res) => {
  try {
    const item = await Resource.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });

    if (String(item.college) !== String(req.user.college)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const isOwner = String(item.uploadedBy) === String(req.user.id);
    const isStaff = ["moderator", "admin"].includes(req.user.role);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: "Not allowed" });
    }

    try {
  await cloudinary.uploader.destroy(item.publicId, { resource_type: "image" });
} catch (e) {
  console.error("Cloudinary delete failed (continuing):", e.message);
}
    await item.deleteOne();

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;