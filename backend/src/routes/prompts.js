import { Router } from "express";
import { body, validationResult } from "express-validator";
import Prompt, { CATEGORIES } from "../models/Prompt.js";

const router = Router();

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Validation failed", errors: errors.array() });
  }
  next();
}

const promptValidationRules = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 120 }),
  body("content").trim().notEmpty().withMessage("Prompt content is required"),
  body("category").isIn(CATEGORIES).withMessage("Invalid category"),
  body("description").optional({ checkFalsy: true }).isLength({ max: 300 }),
  body("tags").optional().isArray(),
];

// GET /api/prompts - fetch all prompts
router.get("/", async (_req, res, next) => {
  try {
    const prompts = await Prompt.find().sort({ createdAt: -1 });
    res.json(prompts);
  } catch (err) {
    next(err);
  }
});

// GET /api/prompts/:id - fetch single prompt
router.get("/:id", async (req, res, next) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) return res.status(404).json({ message: "Prompt not found" });
    res.json(prompt);
  } catch (err) {
    next(err);
  }
});

// POST /api/prompts - create a prompt
router.post("/", promptValidationRules, handleValidation, async (req, res, next) => {
  try {
    const { title, content, description, category, tags, isFavorite, isPinned, order } = req.body;
    const prompt = await Prompt.create({
      title,
      content,
      description,
      category,
      tags,
      isFavorite,
      isPinned,
      order,
    });
    res.status(201).json(prompt);
  } catch (err) {
    next(err);
  }
});

// PUT /api/prompts/:id - update a prompt
router.put("/:id", promptValidationRules, handleValidation, async (req, res, next) => {
  try {
    const updated = await Prompt.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!updated) return res.status(404).json({ message: "Prompt not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/prompts/:id - lightweight partial update (favorite, pin, reorder)
router.patch("/:id", async (req, res, next) => {
  try {
    const updated = await Prompt.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!updated) return res.status(404).json({ message: "Prompt not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/prompts/reorder/bulk - persist drag & drop order
router.patch("/reorder/bulk", async (req, res, next) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ message: "orderedIds must be an array" });
    }
    await Promise.all(
      orderedIds.map((id, index) => Prompt.findByIdAndUpdate(id, { order: index })),
    );
    res.json({ message: "Order updated" });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/prompts/:id - delete a prompt
router.delete("/:id", async (req, res, next) => {
  try {
    const deleted = await Prompt.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Prompt not found" });
    res.json({ message: "Prompt deleted", id: req.params.id });
  } catch (err) {
    next(err);
  }
});

export default router;
