const Subject = require("../models/subjectModel");

// Function to get the next week's date if today is Saturday or Sunday
const getStartDate = () => {
  let today = new Date();
  if (today.getDay() === 6) today.setDate(today.getDate() + 2); // If Saturday, move to Monday
  if (today.getDay() === 0) today.setDate(today.getDate() + 1); // If Sunday, move to Monday
  return today;
};

// Function to format date as DD-MM-YYYY
const formatDate = (date) => {
  return `${String(date.getDate()).padStart(2, "0")}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${date.getFullYear()}`;
};

// Generate weekly timetable
const generateWeeklyTimetable = async (req, res) => {
  try {
    const userId = req.user._id; // Make sure user is added to req (e.g., via middleware)

    const subjects = await Subject.find({ userId }); // Filter by user ID
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];

    let startDate = getStartDate();
    let timetable = {};

    days.forEach((day, index) => {
      let date = new Date(startDate);
      date.setDate(startDate.getDate() + index);

      timetable[day] = {
        date: formatDate(date),
        subjects: [],
        timings: [],
      };
    });

    subjects.forEach((subject) => {
      days.forEach((day) => {
        if (subject.timings[day]) {
          timetable[day].subjects.push(subject.name);
          timetable[day].timings.push(subject.timings[day]);
        }
      });
    });

    res.status(200).json(timetable);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { generateWeeklyTimetable };
