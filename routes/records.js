const router = require("express").Router();
const pool = require("../db");

const STATUSES = ["Pending", "In progress", "Completed"];
const COLUMNS = "id, title, category, description, status";
const MAX_ID = 2147483647; // largest value the database id column can hold

/* ----- Validation helpers ----- */

// Returns { id } when valid, { error, code } when not.
function parseId(raw) {
  if (!/^[1-9][0-9]*$/.test(String(raw))) {
    return { error: "id must be a positive whole number.", code: 400 };
  }
  const id = Number(raw);
  if (id > MAX_ID) {
    return { error: "Record not found.", code: 404 };
  }
  return { id };
}

function checkText(value, label, min, max) {
  if (typeof value !== "string") {
    return { error: label + " is required and must be text." };
  }
  const cleaned = value.trim();
  if (cleaned.length < min || cleaned.length > max) {
    return { error: label + " must have " + min + " to " + max + " characters." };
  }
  return { value: cleaned };
}

// Returns { data } when valid, { error } when not. Any client-supplied id is ignored.
function validateBody(body) {
  const input = body && typeof body === "object" && !Array.isArray(body) ? body : {};

  const title = checkText(input.title, "Title", 3, 80);
  if (title.error) return { error: title.error };

  const category = checkText(input.category, "Category", 2, 40);
  if (category.error) return { error: category.error };

  const description = checkText(input.description, "Description", 5, 300);
  if (description.error) return { error: description.error };

  if (typeof input.status !== "string" || !STATUSES.includes(input.status.trim())) {
    return { error: "Status must be Pending, In progress or Completed." };
  }

  return {
    data: {
      title: title.value,
      category: category.value,
      description: description.value,
      status: input.status.trim()
    }
  };
}

/* ----- GET all ----- */
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT " + COLUMNS + " FROM records ORDER BY id"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

/* ----- GET one ----- */
router.get("/:id", async (req, res, next) => {
  try {
    const parsed = parseId(req.params.id);
    if (parsed.error) return res.status(parsed.code).json({ message: parsed.error });

    const result = await pool.query(
      "SELECT " + COLUMNS + " FROM records WHERE id = $1",
      [parsed.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Record not found." });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

/* ----- POST (create) ----- */
router.post("/", async (req, res, next) => {
  try {
    const checked = validateBody(req.body);
    if (checked.error) return res.status(400).json({ message: checked.error });

    const { title, category, description, status } = checked.data;
    const result = await pool.query(
      "INSERT INTO records (title, category, description, status) " +
      "VALUES ($1, $2, $3, $4) RETURNING *",
      [title, category, description, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

/* ----- PUT (update all four fields) ----- */
router.put("/:id", async (req, res, next) => {
  try {
    const parsed = parseId(req.params.id);
    if (parsed.error) return res.status(parsed.code).json({ message: parsed.error });

    const checked = validateBody(req.body);
    if (checked.error) return res.status(400).json({ message: checked.error });

    const { title, category, description, status } = checked.data;
    const result = await pool.query(
      "UPDATE records SET title = $1, category = $2, description = $3, status = $4 " +
      "WHERE id = $5 RETURNING *",
      [title, category, description, status, parsed.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Record not found." });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

/* ----- DELETE ----- */
router.delete("/:id", async (req, res, next) => {
  try {
    const parsed = parseId(req.params.id);
    if (parsed.error) return res.status(parsed.code).json({ message: parsed.error });

    const result = await pool.query(
      "DELETE FROM records WHERE id = $1 RETURNING id",
      [parsed.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Record not found." });
    }
    res.status(200).json({ message: "Record deleted." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;