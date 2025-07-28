const express = require("express");

const {
  generateWeeklyTimetable,
} = require("../controllers/timetableController");

const router = express.Router();

router.get("/", generateWeeklyTimetable);

module.exports = router;
