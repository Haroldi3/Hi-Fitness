const router = require("express").Router();
const axios = require("axios");

// GET /api/exercises?muscle=chest&difficulty=beginner
router.get("/", async (req, res) => {
  try {
    const { name, muscle, type, difficulty, offset } = req.query;

    const r = await axios.get("https://api.api-ninjas.com/v1/exercises", {
      params: { name, muscle, type, difficulty, offset },
      headers: { "X-Api-Key": process.env.APININJAS_KEY },
      timeout: 15000,
    });

    res.json({ results: r.data || [] });
  } catch (err) {
    res.status(500).json({
      error: "Exercise lookup failed",
      detail: err?.response?.data || err.message,
    });
  }
});

module.exports = router;
