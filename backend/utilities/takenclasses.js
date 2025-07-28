const Subject = require("../models/subjectModel");
const Session = require("../models/sesseionModel");

const calculateTakenClasses = async (subjectId) => {
  const subject = await Subject.findById(subjectId);

  if (!subject || !subject.sessionId) {
    throw new Error("Subject or associated session not found.");
  }

  const session = await Session.findById(subject.sessionId); // Fetch session by sessionId

  if (!session) {
    throw new Error("No session data found for the given session ID.");
  }

  const { startdate, enddate, holidays } = session;
  const today = new Date();
  const start = new Date(startdate);
  const end = new Date(enddate);
  const holidaysList = holidays.map((date) => new Date(date).toDateString());

  if (today < start) return 0; // No classes before the start date

  // Ensure we're within the session period
  const dayDiff = Math.min(
    Math.floor((today - start) / (1000 * 60 * 60 * 24)),
    Math.floor((end - start) / (1000 * 60 * 60 * 24))
  );

  let totalClasses = 0;

  // Loop through each day between start and today
  for (let i = 0; i <= dayDiff; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);

    // Skip holidays
    if (holidaysList.includes(currentDate.toDateString())) continue;

    // Check weekday for scheduling
    const dayName = currentDate
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();

    // Check if subject has a class scheduled for this day
    if (subject.timings[dayName] && subject.timings[dayName] !== "") {
      totalClasses++; // Add class to total count

      // Check if the class was not taken on this particular date (consider timings for classnottaken)
      const missedClass = subject.classnottaken.find(
        (entry) =>
          new Date(entry.date).toDateString() === currentDate.toDateString() &&
          subject.timings[dayName] === entry.timings // Ensure the timings match
      );
      if (missedClass) {
        totalClasses--; // Subtract missed class
      }
    }
  }

  return Math.max(totalClasses, 0); // Ensure non-negative number of classes
};

module.exports = { calculateTakenClasses };
