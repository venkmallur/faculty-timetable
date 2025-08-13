const express = require("express");
require("dotenv").config();
const sessionRoutes = require("./routes/sessionRouter");
const subjectRoutes = require("./routes/subjectRouter");
const timetableRoutes = require("./routes/timetableRouter");
const authRoutes = require("./routes/authRoutes");
const protect = require("./middleware/authMiddleware");

const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
    "http://localhost:3000", // for local dev
    "https://faculty-timetable-frontend.onrender.com" // your Render frontend URL
  ]
  })
);
app.use("/api/auth", authRoutes);
app.use("/api/session", protect, sessionRoutes);
app.use("/api/subject", protect, subjectRoutes);
app.use("/api/timetable", protect, timetableRoutes);

mongoose
  .connect(process.env.MONG_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("connected to db listening on port ...");
    });
  })
  .catch((err) => {
    console.log(err);
  });
