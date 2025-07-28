const express = require("express");

const {
  getAllSession,
  getSession,
  createSession,
  updateSession,
  deleteSession,
  addHolidays,
  removeHolidays,
  getSessionHolidays,
} = require("../controllers/sessionController");

const router = express.Router();

router.get("/holidays/:id/", getSessionHolidays);

router.get("/", getAllSession);

router.get("/:id", getSession);

router.post("/", createSession);

router.patch("/:id", updateSession);

router.delete("/:id", deleteSession);

// Add a holiday
router.patch("/add-holiday/:id/", addHolidays);

// Remove a holiday
router.patch("/remove-holiday/:id/", removeHolidays);

module.exports = router;
