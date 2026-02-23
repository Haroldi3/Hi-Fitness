const router = require("express").Router();
const axios = require("axios");

let cachedToken = null;
let tokenExpires = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpires) return cachedToken;

  const clientId = process.env.FATSECRET_CLIENT_ID;
  const clientSecret = process.env.FATSECRET_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing FATSECRET_CLIENT_ID or FATSECRET_CLIENT_SECRET in .env"
    );
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await axios.post(
    "https://oauth.fatsecret.com/connect/token",
    "grant_type=client_credentials&scope=basic",
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  cachedToken = res.data.access_token;
  tokenExpires = Date.now() + (res.data.expires_in - 60) * 1000; // refresh 1 min early

  return cachedToken;
}

// GET /api/nutrition/search?q=rice and chicken
router.get("/search", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Query param 'q' is required" });

    const token = await getAccessToken();

    const r = await axios.get("https://platform.fatsecret.com/rest/server.api", {
      params: {
        method: "foods.search",
        search_expression: query,
        format: "json",
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Normalise into the shape the front-end expects: { items: [{ name, calories }] }
    const rawFoods = r.data?.foods?.food || [];
    const items = (Array.isArray(rawFoods) ? rawFoods : [rawFoods]).map((f) => {
      // FatSecret returns a description string like "Per 100g - Calories: 130kcal | ..."
      // Extract the calorie number from it
      const descr = f.food_description || "";
      const calMatch = descr.match(/Calories:\s*([\d.]+)/i);
      const calories = calMatch ? parseFloat(calMatch[1]) : 0;

      return {
        id: f.food_id,
        name: f.food_name,
        brand: f.brand_name || "",
        calories,
        description: descr,
      };
    });

    res.json({ items });
  } catch (err) {
    console.error("Nutrition search error:", err?.response?.data || err.message);
    res.status(500).json({
      error: "Failed to fetch nutrition data",
      detail: err?.response?.data || err.message,
    });
  }
});

module.exports = router;
