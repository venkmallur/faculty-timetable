const Session = require("../models/sesseionModel");
const Subject = require("../models/subjectModel");
const axios = require("axios");
require("dotenv").config();
const mongoose = require("mongoose");

// ========================== GET ALL SESSIONS (User-specific)
const getAllSession = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id });
    res.status(200).json(sessions);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

// ========================== ADD HOLIDAYS
const addHolidays = async (req, res) => {
  const { id } = req.params;
  const { holidays } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such session" });
  }

  try {
    const session = await Session.findOne({ _id: id, userId: req.user._id });
    if (!session) return res.status(404).json({ error: "No such session" });

    let newHolidays = [];
    holidays.forEach((holiday) => {
      const holidayDate = new Date(holiday);
      if (
        !isNaN(holidayDate) &&
        !session.holidays.some(
          (existingHoliday) =>
            existingHoliday.toISOString() === holidayDate.toISOString()
        )
      ) {
        newHolidays.push(holidayDate);
      }
    });

    if (newHolidays.length === 0)
      return res.status(400).json({ error: "No new holidays to add" });

    session.holidays.push(...newHolidays);
    session.workingdays = calculateWorkingDays(
      session.startdate,
      session.enddate,
      session.holidays
    );

    await session.save();
    res.status(200).json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ========================== REMOVE HOLIDAYS
const removeHolidays = async (req, res) => {
  const { id } = req.params;
  const { holidays } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such session" });
  }

  try {
    const session = await Session.findOne({ _id: id, userId: req.user._id });
    if (!session) return res.status(404).json({ error: "No such session" });

    const holidaySet = new Set(
      holidays.map((h) => new Date(h).toISOString().split("T")[0])
    );

    const initialLength = session.holidays.length;
    session.holidays = session.holidays.filter(
      (existingHoliday) =>
        !holidaySet.has(new Date(existingHoliday).toISOString().split("T")[0])
    );

    session.workingdays = calculateWorkingDays(
      session.startdate,
      session.enddate,
      session.holidays
    );

    await session.save();

    res.status(200).json({
      message: "Holiday removed successfully",
      updatedHolidays: session.holidays,
      updatedWorkingDays: session.workingdays,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ========================== GET ONE SESSION
const getSession = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "no such Session" });
  }

  const session = await Session.findOne({ _id: id, userId: req.user._id });
  if (!session) return res.status(404).json({ error: "No such session" });

  res.status(200).json(session);
};

// ========================== CREATE SESSION
const getHolidays = async (startdate, enddate) => {
  const holidays = [];
  const apiKey = process.env.apikey;
  const country = "IN";
  const state = "KA";

  const response = await axios.get(
    `https://holidayapi.com/v1/holidays?key=${apiKey}&country=${country}&year=2024`
  );

  const publicHolidays = response.data.holidays || [];
  for (const holiday of publicHolidays) {
    const holidayDate = new Date(holiday.date);
    if (
      holidayDate >= new Date(startdate) &&
      holidayDate <= new Date(enddate)
    ) {
      holidays.push(holiday.date);
    }
  }

  let currentDate = new Date(startdate);
  while (currentDate <= new Date(enddate)) {
    if (currentDate.getDay() === 6 || currentDate.getDay() === 0) {
      holidays.push(currentDate.toISOString().split("T")[0]);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return [...new Set(holidays)];
};

const calculateWorkingDays = (startdate, enddate, holidays) => {
  let workingDays = 0;
  let currentDate = new Date(startdate);
  const holidaySet = new Set(
    holidays.map((h) => new Date(h).toISOString().split("T")[0])
  );

  while (currentDate <= new Date(enddate)) {
    const dateStr = currentDate.toISOString().split("T")[0];
    if (
      !holidaySet.has(dateStr) &&
      currentDate.getDay() !== 0 &&
      currentDate.getDay() !== 6
    ) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDays;
};

const createSession = async (req, res) => {
  const { name, startdate, enddate } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ error: "Session name is required." });
    }

    const holidays = await getHolidays(startdate, enddate);
    const workingDays = calculateWorkingDays(startdate, enddate, holidays);

    const session = await Session.create({
      name,
      startdate,
      enddate,
      holidays,
      workingdays: workingDays,
      userId: req.user._id, // User-specific
    });

    res.status(200).json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ========================== DELETE SESSION
const deleteSession = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid session ID" });
  }

  try {
    const session = await Session.findOne({ _id: id, userId: req.user._id });
    if (!session) return res.status(404).json({ error: "No such session" });

    await Subject.deleteMany({ sessionId: id });
    await Session.findByIdAndDelete(id);

    res.status(200).json({
      message: "Session and associated subjects deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ========================== UPDATE SESSION
const updateSession = async (req, res) => {
  const { id } = req.params;
  const { startdate, enddate } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such session" });
  }

  try {
    const session = await Session.findOne({ _id: id, userId: req.user._id });
    if (!session) {
      return res.status(404).json({ error: "No such session" });
    }

    let datesChanged = false;

    if (
      startdate &&
      new Date(startdate).toISOString() !== session.startdate.toISOString()
    ) {
      session.startdate = new Date(startdate);
      datesChanged = true;
    }

    if (
      enddate &&
      new Date(enddate).toISOString() !== session.enddate.toISOString()
    ) {
      session.enddate = new Date(enddate);
      datesChanged = true;
    }

    if (datesChanged) {
      session.holidays = await getHolidays(session.startdate, session.enddate);
    }

    session.workingdays = calculateWorkingDays(
      session.startdate,
      session.enddate,
      session.holidays
    );

    await session.save();
    res.status(200).json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ========================== GET SESSION HOLIDAYS
const getSessionHolidays = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid session ID" });
  }

  try {
    const session = await Session.findOne({
      _id: id,
      userId: req.user._id,
    }).select("holidays");

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.status(200).json({ holidays: session.holidays });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllSession,
  getSession,
  createSession,
  updateSession,
  deleteSession,
  addHolidays,
  removeHolidays,
  getSessionHolidays,
};
