const router = require("express").Router();
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

// POST /api/meal-photo/estimate (multipart/form-data: image=<file>)
router.post("/estimate", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "image is required" });

    // TODO: send req.file.buffer to a vision provider (Edamam Vision / LogMeal / CalorieMama)
    // For tonight: return placeholder so UI flow works end-to-end
    res.json({
      foods: [],
      totalCalories: null,
      note: "Photo calorie estimation not implemented yet (provider needed).",
    });
  } catch (err) {
    res.status(500).json({ error: "Meal photo failed", detail: err.message });
  }
});

module.exports = router;
