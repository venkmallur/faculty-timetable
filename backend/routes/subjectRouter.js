const express = require("express");

const {
  getAllSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  addclassnottaken,
} = require("../controllers/subjectController");

const router = express.Router();

router.get("/", getAllSubjects);

router.get("/:id", getSubject);

router.post("/", createSubject);

router.patch("/classnottaken/:id", addclassnottaken);

router.patch("/:id", updateSubject);

router.delete("/:id", deleteSubject);

module.exports = router;
