const router = require("express").Router();
const axios = require("axios");

// GET /api/places/trails?lat=40.7128&lon=-74.0060&radius=5000
router.get("/trails", async (req, res) => {
  try {
    const { lat, lon, radius = 5000 } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: "lat and lon required" });

    const categories =
      "leisure.park,natural.forest,natural.mountain,sport.track,sport.fitness";

    const r = await axios.get("https://api.geoapify.com/v2/places", {
      params: {
        categories,
        filter: `circle:${lon},${lat},${radius}`,
        bias: `proximity:${lon},${lat}`,
        limit: 25,
        apiKey: process.env.GEOAPIFY_KEY,
      },
      timeout: 15000,
    });

    const places = (r.data.features || []).map((f) => ({
      name: f.properties.name || "Unknown",
      address: f.properties.formatted || "",
      lat: f.properties.lat,
      lon: f.properties.lon,
      categories: f.properties.categories || [],
    }));

    res.json({ places });
  } catch (err) {
    res.status(500).json({
      error: "Places lookup failed",
      detail: err?.response?.data || err.message,
    });
  }
});

module.exports = router;
