const mongoose = require("mongoose");

const assignmentSubmissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  file: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  grade: { type: String, default: "" },
  feedback: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("AssignmentSubmission", assignmentSubmissionSchema); 