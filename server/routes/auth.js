const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const College = require("../models/College");
const auth = require("../middleware/auth");

const router = express.Router();

const escapeRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const clean = (s = "") => String(s).trim().replace(/\s+/g, " ");

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15,
  message: { message: "Too many signups from this network. Try again later." },
});

const makeToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, college: user.college },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// POST /api/auth/signup
router.post("/signup", signupLimiter, async (req, res) => {
  try {
    const { name, email, password, collegeId, newCollege, branch, semester } = req.body || {};

    if (!name || !email || !password || !branch || !semester || (!collegeId && !newCollege)) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    let college;
    let role = "student";

    if (collegeId) {
      college = await College.findById(collegeId);
      if (!college) return res.status(400).json({ message: "Invalid college" });
    } else {
      const cname = clean(newCollege.name);
      if (cname.length < 3 || cname.length > 100) {
        return res.status(400).json({ message: "College name must be 3 to 100 characters" });
      }

      // reuse an existing college if the name matches (ignoring case and spacing)
      college = await College.findOne({
        name: new RegExp(`^${escapeRx(cname)}$`, "i"),
      });

      if (!college) {
        college = await College.create({
          name: cname,
          city: clean(newCollege.city).slice(0, 60),
          state: clean(newCollege.state).slice(0, 60),
        });
        role = "moderator"; // first person from a new college looks after it
      }
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: clean(name),
      email,
      password: hashed,
      college: college._id,
      branch,
      semester,
      role,
    });

    res.status(201).json({
      token: makeToken(user),
      user: {
        id: user._id, name: user.name, email: user.email, role: user.role,
        college: college.name, branch: user.branch, semester: user.semester,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).populate("college");
    const ok = user && (await bcrypt.compare(password, user.password));
    if (!ok) return res.status(400).json({ message: "Invalid email or password" });

    res.json({
      token: makeToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college.name,
        branch: user.branch,
        semester: user.semester,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/auth/me  (protected)
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password").populate("college");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

module.exports = router;