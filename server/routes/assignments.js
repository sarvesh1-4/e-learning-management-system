const express = require("express");
const Assignment = require("../models/Assignment");
const AssignmentSubmission = require("../models/AssignmentSubmission");
const { adminAuth, auth } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Multer setup for assignment attachment
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/assignments"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-assignment" + ext);
  },
});
const upload = multer({ storage });

// Create assignment (admin only)
router.post("/", adminAuth, upload.single("attachment"), async (req, res) => {
  try {
    const { course, title, description, dueDate } = req.body;
    if (!course || !title || !description || !dueDate) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const assignment = new Assignment({
      course,
      title,
      description,
      dueDate,
      attachment: req.file ? `/uploads/assignments/${req.file.filename}` : "",
    });
    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// List all assignments (admin only)
router.get("/", adminAuth, async (req, res) => {
  try {
    const assignments = await Assignment.find().populate("course", "title").sort({ dueDate: 1 });
    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// List assignments for a course
router.get("/course/:courseId", auth, async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId }).sort({ dueDate: 1 });
    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Learner: Submit assignment
router.post("/:assignmentId/submit", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }
    // Only one submission per user per assignment
    let submission = await AssignmentSubmission.findOne({
      assignment: req.params.assignmentId,
      user: req.user._id,
    });
    if (submission) {
      submission.file = `/uploads/assignments/${req.file.filename}`;
      submission.submittedAt = new Date();
      await submission.save();
    } else {
      submission = new AssignmentSubmission({
        assignment: req.params.assignmentId,
        user: req.user._id,
        file: `/uploads/assignments/${req.file.filename}`,
      });
      await submission.save();
    }
    res.status(201).json(submission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Learner: Get own submission for an assignment
router.get("/:assignmentId/submissions", auth, async (req, res) => {
  try {
    const submission = await AssignmentSubmission.findOne({
      assignment: req.params.assignmentId,
      user: req.user._id,
    });
    res.json(submission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: List all submissions for an assignment
router.get("/:assignmentId/all-submissions", adminAuth, async (req, res) => {
  try {
    const submissions = await AssignmentSubmission.find({ assignment: req.params.assignmentId })
      .populate("user", "name email")
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: List all submissions for all assignments
router.get("/all-submissions", adminAuth, async (req, res) => {
  try {
    const submissions = await AssignmentSubmission.find()
      .populate("user", "name email")
      .populate("assignment", "title course dueDate")
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: Grade and give feedback for a submission
router.put("/:assignmentId/submissions/:submissionId", adminAuth, async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const submission = await AssignmentSubmission.findByIdAndUpdate(
      req.params.submissionId,
      { grade, feedback },
      { new: true }
    );
    res.json(submission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router; 