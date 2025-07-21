const express = require("express")
const { body, validationResult } = require("express-validator")
const Course = require("../models/Course")
const Enrollment = require("../models/Enrollment")
const { auth, adminAuth } = require("../middleware/auth")

const router = express.Router()

// Get all courses
router.get("/", async (req, res) => {
  try {
    const { category, level, search } = req.query
    const query = { isPublished: true }

    if (category) query.category = category
    if (level) query.level = level
    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    const courses = await Course.find(query).populate("instructor", "name email").sort({ createdAt: -1 })

    res.json(courses)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get course by ID
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("instructor", "name email")

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    res.json(course)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create course (Admin only)
router.post(
  "/",
  [
    adminAuth,
    [
      body("title").trim().isLength({ min: 3 }).withMessage("Title must be at least 3 characters"),
      body("description").trim().isLength({ min: 10 }).withMessage("Description must be at least 10 characters"),
      body("category").trim().notEmpty().withMessage("Category is required"),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const courseData = {
        ...req.body,
        instructor: req.user._id,
      }

      const course = new Course(courseData)
      await course.save()

      const populatedCourse = await Course.findById(course._id).populate("instructor", "name email")

      res.status(201).json(populatedCourse)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update course (Admin only)
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(
      "instructor",
      "name email",
    )

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    res.json(course)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete course (Admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id)

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Also delete related enrollments
    await Enrollment.deleteMany({ course: req.params.id })

    res.json({ message: "Course deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get courses for admin dashboard
router.get("/admin/all", adminAuth, async (req, res) => {
  try {
    const courses = await Course.find().populate("instructor", "name email").sort({ createdAt: -1 })

    res.json(courses)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
