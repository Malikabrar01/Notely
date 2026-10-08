const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Not logged in" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("role college");
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = {
      id: String(user._id),
      role: user.role,
      college: String(user.college),
    };
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};