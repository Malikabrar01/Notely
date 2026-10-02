const express = require("express");
const College = require("../models/College");

const router = express.Router();

// GET /api/colleges
router.get("/", async (req, res) => {
  const colleges = await College.find().sort("name");
  res.json(colleges);
});

module.exports = router;