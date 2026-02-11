require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/health", (req, res) => res.json({ ok: true }));

// ---- YOUR EXISTING ROUTES ----
// Example:
// app.use("/api/workouts", require("./routes/workouts"));

// ---- NEW ROUTES FOR EXPO APP ----
app.use("/api/exercises", require("./routes/exercises"));
app.use("/api/nutrition", require("./routes/nutrition"));
app.use("/api/places", require("./routes/places"));
app.use("/api/meal-photo", require("./routes/mealPhoto"));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`✅ Backend running on port ${port}`));
