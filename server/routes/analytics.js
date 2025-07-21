const express = require("express")
const Course = require("../models/Course")
const Enrollment = require("../models/Enrollment")
const QuizAttempt = require("../models/QuizAttempt")
const User = require("../models/User")
const { adminAuth } = require("../middleware/auth")

const router = express.Router()

// Get dashboard analytics
router.get("/dashboard", adminAuth, async (req, res) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments({ role: "learner" })
    const totalCourses = await Course.countDocuments()
    const totalEnrollments = await Enrollment.countDocuments()
    const completedCourses = await Enrollment.countDocuments({ status: "completed" })

    // Course popularity
    const popularCourses = await Course.find().sort({ enrollmentCount: -1 }).limit(5).select("title enrollmentCount")

    // Recent enrollments
    const recentEnrollments = await Enrollment.find()
      .populate("user", "name email")
      .populate("course", "title")
      .sort({ enrolledAt: -1 })
      .limit(10)

    // Quiz performance
    const quizStats = await QuizAttempt.aggregate([
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: "$score" },
          passRate: {
            $avg: {
              $cond: ["$passed", 1, 0],
            },
          },
        },
      },
    ])

    // Monthly enrollment trends
    const enrollmentTrends = await Enrollment.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$enrolledAt" },
            month: { $month: "$enrolledAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $limit: 12,
      },
    ])

    res.json({
      overview: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        completedCourses,
        completionRate: totalEnrollments > 0 ? Math.round((completedCourses / totalEnrollments) * 100) : 0,
      },
      popularCourses,
      recentEnrollments,
      quizStats: quizStats[0] || { totalAttempts: 0, averageScore: 0, passRate: 0 },
      enrollmentTrends,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get course-specific analytics
router.get("/course/:courseId", adminAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Enrollment statistics
    const enrollments = await Enrollment.find({ course: req.params.courseId }).populate("user", "name email")

    const totalEnrollments = enrollments.length
    const completedEnrollments = enrollments.filter((e) => e.status === "completed").length
    const activeEnrollments = enrollments.filter((e) => e.status === "active").length

    // Progress distribution
    const progressDistribution = enrollments.reduce((acc, enrollment) => {
      const range = Math.floor(enrollment.progress / 20) * 20
      const key = `${range}-${range + 19}%`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    // Quiz performance for this course
    const quizPerformance = await QuizAttempt.aggregate([
      {
        $lookup: {
          from: "quizzes",
          localField: "quiz",
          foreignField: "_id",
          as: "quizInfo",
        },
      },
      {
        $match: {
          "quizInfo.course": course._id,
        },
      },
      {
        $group: {
          _id: "$quiz",
          quizTitle: { $first: { $arrayElemAt: ["$quizInfo.title", 0] } },
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: "$score" },
          passRate: {
            $avg: {
              $cond: ["$passed", 1, 0],
            },
          },
        },
      },
    ])

    res.json({
      course: {
        title: course.title,
        totalEnrollments,
        completedEnrollments,
        activeEnrollments,
        completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
      },
      progressDistribution,
      quizPerformance,
      enrollments: enrollments.map((e) => ({
        user: e.user,
        progress: e.progress,
        status: e.status,
        enrolledAt: e.enrolledAt,
        completedAt: e.completedAt,
      })),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
