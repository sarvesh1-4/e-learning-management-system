const express = require("express")
const Enrollment = require("../models/Enrollment")
const QuizAttempt = require("../models/QuizAttempt")
const Quiz = require("../models/Quiz")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Get user's overall progress
router.get("/overview", auth, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id }).populate("course", "title category")

    const totalCourses = enrollments.length
    const completedCourses = enrollments.filter((e) => e.status === "completed").length
    const inProgressCourses = enrollments.filter((e) => e.status === "active").length

    // Get quiz statistics
    const quizAttempts = await QuizAttempt.find({ user: req.user._id })
    const totalQuizzes = quizAttempts.length
    const passedQuizzes = quizAttempts.filter((a) => a.passed).length

    // Calculate average score
    const averageScore =
      totalQuizzes > 0 ? Math.round(quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalQuizzes) : 0

    // Get recent activity
    const recentEnrollments = enrollments.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5)

    res.json({
      totalCourses,
      completedCourses,
      inProgressCourses,
      totalQuizzes,
      passedQuizzes,
      averageScore,
      recentActivity: recentEnrollments,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get detailed progress for a course
router.get("/course/:courseId", auth, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: req.params.courseId,
    }).populate("course")

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" })
    }

    // Get quiz attempts for this course
    const quizAttempts = await QuizAttempt.find({
      user: req.user._id,
    }).populate({
      path: "quiz",
      match: { course: req.params.courseId },
      select: "title passingScore",
    })

    const courseQuizAttempts = quizAttempts.filter((attempt) => attempt.quiz)

    res.json({
      enrollment,
      quizAttempts: courseQuizAttempts,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get detailed progress for all enrolled courses (for /my endpoint)
router.get("/my", auth, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id }).populate("course")
    const progress = []
    for (const enrollment of enrollments) {
      // Get quizzes for this course
      const quizzes = await Quiz.find({ course: enrollment.course._id, isActive: true })
      // Get quiz attempts for this course
      const quizAttempts = await QuizAttempt.find({
        user: req.user._id,
      }).populate({
        path: "quiz",
        match: { course: enrollment.course._id },
        select: "title passingScore",
      })
      const courseQuizAttempts = quizAttempts.filter((attempt) => attempt.quiz)
      // Count passed quizzes
      const passedQuizIds = new Set(
        courseQuizAttempts.filter((qa) => qa.passed).map((qa) => qa.quiz._id.toString())
      )
      // Progress calculation
      const totalModules = enrollment.course.modules.length
      const completedModules = enrollment.completedModules.length
      const totalQuizzes = quizzes.length
      const passedQuizzes = quizzes.filter(qz => passedQuizIds.has(qz._id.toString())).length
      let totalParts = totalModules + totalQuizzes
      let completedParts = completedModules + passedQuizzes
      let courseProgress = totalParts > 0 ? Math.round((completedParts / totalParts) * 100) : 0
      progress.push({
        courseId: enrollment.course._id,
        title: enrollment.course.title,
        description: enrollment.course.description,
        progress: courseProgress,
        modules: enrollment.course.modules.map((mod) => ({
          title: mod.title,
          completed: enrollment.completedModules.some((cm) => cm.moduleId.toString() === mod._id.toString()),
        })),
        quizzes: courseQuizAttempts.map((qa) => ({
          quizId: qa.quiz._id,
          title: qa.quiz.title,
          score: qa.score,
          passed: qa.passed,
        })),
      })
    }
    res.json({ progress })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
