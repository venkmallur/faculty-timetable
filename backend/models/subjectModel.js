const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Helper function for time slots
function getTimings() {
  return [
    "9am-10am",
    "9am-11am",
    "10am-11am",
    "11:20am-12:20pm",
    "12:20pm-1:20pm",
    "11:20-1:20pm",
    "2pm-3pm",
    "2pm-4pm",
    "3pm-4pm",
    "4pm-5pm",
    "2pm-5pm",
    "",
  ];
}

const subjectSchema = new Schema({
  name: { type: String, required: true, maxlength: 50 },
  totalclasses: { type: Number, required: true, max: 200 },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Session",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  classnottaken: [
    {
      date: { type: Date, required: true },
      timings: {
        type: String,
        enum: getTimings(),
        required: true,
      },
      reason: { type: String, default: "" },
    },
  ],
  branch: { type: String, required: true, maxlength: 50 },
  sem: {
    type: String,
    enum: ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"],
    required: true,
  },
  timings: {
    monday: { type: String, enum: getTimings(), default: "" },
    tuesday: { type: String, enum: getTimings(), default: "" },
    wednesday: { type: String, enum: getTimings(), default: "" },
    thursday: { type: String, enum: getTimings(), default: "" },
    friday: { type: String, enum: getTimings(), default: "" },
  },
});

module.exports = mongoose.model("Subject", subjectSchema);
