const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  attachment: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Assignment", assignmentSchema); 