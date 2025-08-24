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

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

app.use(
  cors({
    origin: [
      "http://localhost:3000", // for local dev
      "https://faculty-timetable-frontend.onrender.com" // Render frontend
    ]
  })
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/session", protect, sessionRoutes);
app.use("/api/subject", protect, subjectRoutes);
app.use("/api/timetable", protect, timetableRoutes);
app.use('/api', apiRoutes);
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

// Connect to DB and start server
mongoose
  .connect(process.env.MONG_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Connected to DB and listening on port", process.env.PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });
