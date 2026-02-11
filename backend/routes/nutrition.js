const router = require("express").Router();
const axios = require("axios");

let cachedToken = null;
let tokenExpires = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpires) return cachedToken;

  const auth = Buffer.from(
    "https://oauth.fatsecret.com/connect/token",
    "grant_type=client_credentials&scope=basic",
    {
      headers: {
        Authorization: 'Basic ${auth}',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  cachedToken = resizeBy.data.access_token;
  tokenExpires = Date.now() + resizeBy.data.expires_in * 1000; // Refresh 1 minute before expiry

  return cachedToken;
}

// Post / api/nutrition/search
// body: { query: rice and chicken }
router.post("/search", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

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

    const foods = 
    r.data?.foods?.food?.map((f) => ({
      id: f.food_id,
      name: f.food_name,
      brand: f.food_brand || "",
    })) || [];
    res.json({ foods });
  } catch (err) {
    res.status(500).json({ 
      error: "Failed to fetch nutrition data",
      detail: err?.response?.data || err.message,
    });
  }
});

module.exports = router;