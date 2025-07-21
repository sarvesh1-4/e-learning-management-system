const express = require("express")
const Enrollment = require("../models/Enrollment")
const Course = require("../models/Course")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Enroll in a course
router.post("/", auth, async (req, res) => {
  try {
    const { courseId } = req.body

    // Check if course exists
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    })

    if (existingEnrollment) {
      return res.status(400).json({ message: "Already enrolled in this course" })
    }

    // Create enrollment
    const enrollment = new Enrollment({
      user: req.user._id,
      course: courseId,
    })

    await enrollment.save()

    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrollmentCount: 1 },
    })

    const populatedEnrollment = await Enrollment.findById(enrollment._id).populate(
      "course",
      "title description thumbnail duration",
    )

    res.status(201).json(populatedEnrollment)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get user's enrollments
router.get("/my-courses", auth, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate("course", "title description thumbnail duration category level")
      .sort({ enrolledAt: -1 })

    res.json(enrollments)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get user's enrollments (for /my endpoint)
router.get("/my", auth, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate("course", "title description thumbnail duration category level modules")
      .sort({ enrolledAt: -1 })
    res.json({ enrollments })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get enrollment details
router.get("/:courseId", auth, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: req.params.courseId,
    }).populate("course")

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" })
    }

    res.json(enrollment)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Mark module as completed
router.post("/:courseId/complete-module", auth, async (req, res) => {
  try {
    const { moduleId } = req.body

    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: req.params.courseId,
    }).populate("course")

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" })
    }

    // Check if module is already completed
    const isCompleted = enrollment.completedModules.some((cm) => cm.moduleId.toString() === moduleId)

    if (!isCompleted) {
      enrollment.completedModules.push({
        moduleId,
        completedAt: new Date(),
      })

      // Calculate progress
      const totalModules = enrollment.course.modules.length
      const completedCount = enrollment.completedModules.length
      enrollment.progress = Math.round((completedCount / totalModules) * 100)

      // Check if course is completed
      if (enrollment.progress === 100) {
        enrollment.status = "completed"
        enrollment.completedAt = new Date()
      }

      await enrollment.save()
    }

    res.json(enrollment)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get enrollment status for a course
router.get("/status/:courseId", auth, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: req.params.courseId,
    })
    res.json({ enrolled: !!enrollment })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
