const Subject = require("../models/subjectModel");
const Session = require("../models/sesseionModel");
const { calculateTakenClasses } = require("../utilities/takenclasses");
const mongoose = require("mongoose");

const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("sessionId");

    const currentDate = new Date();
    const updatedSubjects = await Promise.all(
      subjects.map(async (subject) => {
        const { totalclasses, sessionId } = subject;
        const takenClasses = await calculateTakenClasses(subject._id);

        if (!sessionId) {
          return {
            ...subject._doc,
            takenClasses,
            message: "No session assigned.",
          };
        }

        const session = sessionId;
        const { enddate, holidays } = session;

        let remainingDays = 0;
        if (currentDate < new Date(enddate)) {
          let tempDate = new Date(currentDate);
          const endDate = new Date(enddate);

          while (tempDate <= endDate) {
            const isWeekend =
              tempDate.getDay() === 0 || tempDate.getDay() === 6;
            const isHoliday = holidays.some(
              (holiday) =>
                new Date(holiday).toDateString() === tempDate.toDateString()
            );

            if (!isWeekend && !isHoliday) {
              remainingDays++;
            }

            tempDate.setDate(tempDate.getDate() + 1);
          }
        }

        const remainingClasses = totalclasses - takenClasses;
        let message = "No special classes needed";
        if (remainingClasses > remainingDays) {
          const extraClasses = remainingClasses - remainingDays;
          message = `${extraClasses} special classes needed`;
        }

        return {
          ...subject._doc,
          takenClasses,
          remainingClasses,
          remainingDays,
          message,
        };
      })
    );

    res.status(200).json(updatedSubjects);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getSubject = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "no such Subject" });
  }

  const subject = await Subject.findOne({ _id: id, userId: req.user._id });
  if (!subject) {
    return res.status(404).json({ error: "No such Subject" });
  }
  res.status(200).json(subject);
};

const createSubject = async (req, res) => {
  try {
    const { name, totalclasses, sessionId, branch, sem, timings } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required." });
    }

    const sessionExists = await Session.findById(sessionId);
    if (!sessionExists) {
      return res
        .status(400)
        .json({ error: "Invalid session ID. Session not found." });
    }

    const subject = new Subject({
      name,
      totalclasses,
      sessionId,
      branch,
      sem,
      timings,
      userId: req.user._id,
    });

    await subject.save();

    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteSubject = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "no such Subject" });
  }

  const subject = await Subject.findOneAndDelete({
    _id: id,
    userId: req.user._id,
  });
  if (!subject) {
    return res.status(404).json({ error: "No such Subject" });
  }
  res.status(200).json(subject);
};

const updateSubject = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "no such Subject" });
  }

  const subject = await Subject.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    {
      ...req.body,
    },
    { new: true }
  );
  if (!subject) {
    return res.status(404).json({ error: "No such Subject" });
  }
  res.status(200).json(subject);
};

const addclassnottaken = async (req, res) => {
  const { id } = req.params;
  const { date, timings, reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such subject found." });
  }

  if (!date || !timings) {
    return res.status(400).json({ error: "Date and timings are required." });
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({ error: "Invalid date format." });
  }
  const dayOfWeek = parsedDate
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();

  const subject = await Subject.findOne({ _id: id, userId: req.user._id });
  if (!subject) {
    return res.status(404).json({ error: "Subject not found." });
  }

  const allowedTiming = subject.timings[dayOfWeek];
  if (allowedTiming !== timings) {
    return res.status(400).json({
      error: `The provided timing '${timings}' does not match the timetable for ${dayOfWeek}. Allowed timing is '${allowedTiming}'.`,
    });
  }

  const existingEntry = subject.classnottaken.find(
    (entry) => new Date(entry.date).toDateString() === parsedDate.toDateString()
  );

  if (existingEntry) {
    return res
      .status(400)
      .json({ error: "This date is already marked as not taken." });
  }

  subject.classnottaken.push({ date: parsedDate, timings, reason });

  await subject.save();

  return res.status(200).json({
    message: "Class not taken successfully added.",
    classnottaken: subject.classnottaken,
  });
};

module.exports = {
  getAllSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  addclassnottaken,
};
